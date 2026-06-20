import { Card, CardContent } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getSellerOrders } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function SellerOrdersPage() {
  const { user } = await requireUserWithRole(["seller"]);
  const orders = await getSellerOrders(user.id);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-semibold">Seller Orders</h1>

        {orders.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-neutral-600">No order items linked to your listings yet.</CardContent></Card>
        ) : null}

        {orders.map((row) => (
          <Card key={`${row.orderId}-${row.productName}-${row.createdAt}`}>
            <CardContent className="space-y-1 p-4 text-sm text-neutral-700">
              <p className="font-medium text-neutral-900">Order #{row.orderId.slice(0, 8)}</p>
              <p>Product: {row.productName}</p>
              <p>Qty: {row.quantity}</p>
              <p>Line total: {formatINR(row.lineTotal)}</p>
              <p>Status: {row.orderStatus}</p>
              <p>Placed: {new Date(row.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
