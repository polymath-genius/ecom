import Link from "next/link";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getAdminListingQueue, getAllOrdersForAdmin, getAllSellers } from "@/lib/marketplace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  await requireUserWithRole(["admin"]);

  const [listings, orders, sellers] = await Promise.all([
    getAdminListingQueue(),
    getAllOrdersForAdmin(),
    getAllSellers(),
  ]);

  const pendingListings = listings.filter((x) => x.status === "pending").length;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p className="text-sm text-neutral-600">Manage products, listing approvals, sellers, orders, and payouts.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader><CardTitle className="text-base">Pending Listings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{pendingListings}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">All Sellers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{sellers.length}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">All Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{orders.length}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Approved Listings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{listings.filter((x) => x.status === "approved").length}</p></CardContent></Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/products" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Create Products</Link>
          <Link href="/admin/listings" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Approve / Reject Listings</Link>
          <Link href="/admin/sellers" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Manage Sellers</Link>
          <Link href="/admin/orders" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">View All Orders</Link>
          <Link href="/admin/payouts" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Handle Payouts</Link>
        </section>
      </div>
    </main>
  );
}
