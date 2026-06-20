import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getAdminListingQueue, setListingReviewStatus } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function AdminListingsPage() {
  await requireUserWithRole(["admin"]);
  const listings = await getAdminListingQueue();

  async function approveListing(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const listingId = String(formData.get("listingId") || "");
    const note = String(formData.get("note") || "").trim();
    if (!listingId) return;

    await setListingReviewStatus({ listingId, decision: "approved", note });
    revalidatePath("/admin/listings");
    revalidatePath("/admin");
  }

  async function rejectListing(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const listingId = String(formData.get("listingId") || "");
    const note = String(formData.get("note") || "").trim();
    if (!listingId) return;

    await setListingReviewStatus({ listingId, decision: "rejected", note });
    revalidatePath("/admin/listings");
    revalidatePath("/admin");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-semibold">Listing Approval Queue</h1>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-neutral-600">No seller listings available yet.</CardContent>
          </Card>
        ) : null}

        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span>{listing.productName}</span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs uppercase">{listing.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Seller: {listing.sellerName} ({listing.sellerEmail})</p>
              <p>Requested Price: {formatINR(listing.price)} | Stock: {listing.stock}</p>
              <p>Catalog Product: {listing.isPublished ? "Published" : "Not published"}</p>

              {listing.status === "pending" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <form action={approveListing} className="space-y-2">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <Input name="note" placeholder="Optional admin note" />
                    <Button type="submit" className="w-full">Approve</Button>
                  </form>

                  <form action={rejectListing} className="space-y-2">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <Input name="note" placeholder="Reason for rejection" required />
                    <Button type="submit" variant="outline" className="w-full">Reject</Button>
                  </form>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">This listing has already been reviewed and is locked.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
