import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { deleteUserAndSellerDataByClerkId, getAllSellers, setSellerApproval } from "@/lib/marketplace";

export default async function AdminSellersPage() {
  await requireUserWithRole(["admin"]);
  const sellers = await getAllSellers();

  async function updateApproval(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const clerkUserId = String(formData.get("clerkUserId") || "");
    const next = String(formData.get("approved") || "false") === "true";
    if (!clerkUserId) return;

    await setSellerApproval(clerkUserId, next);
    revalidatePath("/admin/sellers");
    revalidatePath("/admin");
  }

  async function updateRole(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const clerkUserId = String(formData.get("clerkUserId") || "");
    const role = String(formData.get("role") || "customer");
    if (!clerkUserId || (role !== "seller" && role !== "customer")) return;

    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      privateMetadata: {
        role,
      },
      publicMetadata: {
        role,
      },
    });

    revalidatePath("/admin/sellers");
  }

  async function deleteSeller(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const clerkUserId = String(formData.get("clerkUserId") || "");
    if (!clerkUserId) return;

    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
    await deleteUserAndSellerDataByClerkId(clerkUserId);

    revalidatePath("/admin/sellers");
    revalidatePath("/admin");
    revalidatePath("/seller");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-semibold">Manage Sellers</h1>

        {sellers.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-neutral-600">No seller profiles found yet.</CardContent></Card>
        ) : null}

        {sellers.map((seller) => (
          <Card key={seller.id}>
            <CardHeader>
              <CardTitle className="text-base">{seller.displayName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{seller.email}</p>
              <p>Status: {seller.isApproved ? "Approved" : "Pending"}</p>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <form action={updateApproval}>
                  <input type="hidden" name="clerkUserId" value={seller.clerkUserId} />
                  <input type="hidden" name="approved" value={seller.isApproved ? "false" : "true"} />
                  <Button type="submit" className="w-full" variant={seller.isApproved ? "outline" : "default"}>
                    {seller.isApproved ? "Mark Pending" : "Approve Seller"}
                  </Button>
                </form>

                <form action={updateRole}>
                  <input type="hidden" name="clerkUserId" value={seller.clerkUserId} />
                  <input type="hidden" name="role" value="seller" />
                  <Button type="submit" className="w-full" variant="outline">Set Role: Seller</Button>
                </form>

                <form action={updateRole}>
                  <input type="hidden" name="clerkUserId" value={seller.clerkUserId} />
                  <input type="hidden" name="role" value="customer" />
                  <Button type="submit" className="w-full" variant="outline">Set Role: Customer</Button>
                </form>

                <form action={deleteSeller}>
                  <input type="hidden" name="clerkUserId" value={seller.clerkUserId} />
                  <Button type="submit" className="w-full" variant="destructive">Delete Seller</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
