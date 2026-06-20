import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getSellerEarnings, getSellerListings, getSellerOrders } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function SellerDashboardPage() {
  const { user } = await requireUserWithRole(["seller"]);

  const [listings, orders, earnings] = await Promise.all([
    getSellerListings(user.id),
    getSellerOrders(user.id),
    getSellerEarnings(user.id),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Seller Dashboard</h1>
          <p className="text-sm text-neutral-600">Create listings, monitor orders, and track earnings.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader><CardTitle className="text-base">Listings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{listings.length}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Pending Review</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{listings.filter((x) => x.status === "pending").length}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{orders.length}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Available Earnings</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{formatINR(earnings.available)}</p></CardContent></Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/seller/listings" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Create and Manage Listings</Link>
          <Link href="/seller/orders" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">View Seller Orders</Link>
          <Link href="/seller/earnings" className="rounded-2xl border bg-white p-5 text-neutral-800 hover:bg-neutral-100">Track Earnings and Payouts</Link>
        </section>
      </div>
    </main>
  );
}
