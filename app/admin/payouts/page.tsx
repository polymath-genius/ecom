import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { createPayoutForSeller, getAdminPayoutRows, getAllSellers } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function AdminPayoutsPage() {
  await requireUserWithRole(["admin"]);
  const [payoutRows, sellers] = await Promise.all([getAdminPayoutRows(), getAllSellers()]);

  async function createPayout(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const clerkUserId = String(formData.get("clerkUserId") || "");
    const amount = String(formData.get("amount") || "0");
    const note = String(formData.get("note") || "");

    if (!clerkUserId || Number.isNaN(Number(amount)) || Number(amount) <= 0) return;

    await createPayoutForSeller({ clerkUserId, amount, note });
    revalidatePath("/admin/payouts");
    revalidatePath("/seller/earnings");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold">Payout Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create Seller Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createPayout} className="grid gap-3 sm:grid-cols-4">
              <select name="clerkUserId" className="h-10 rounded-md border px-3 text-sm sm:col-span-2" required>
                <option value="">Select seller</option>
                {sellers.map((seller) => (
                  <option key={seller.clerkUserId} value={seller.clerkUserId}>{seller.displayName} ({seller.email})</option>
                ))}
              </select>
              <Input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
              <Input name="note" placeholder="Optional note" />
              <div className="sm:col-span-4">
                <Button type="submit">Create payout record</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          {payoutRows.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-neutral-600">No payouts created yet.</CardContent></Card>
          ) : null}

          {payoutRows.map((row) => (
            <Card key={row.payoutId}>
              <CardContent className="p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">{row.sellerName} ({row.sellerEmail})</p>
                <p>Amount: {formatINR(row.amount)}</p>
                <p>Status: {row.status}</p>
                <p>Note: {row.note || "-"}</p>
                <p>Created: {new Date(row.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
