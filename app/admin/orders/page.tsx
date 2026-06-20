import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getAllOrdersForAdmin } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function AdminOrdersPage() {
  await requireUserWithRole(["admin"]);
  const orders = await getAllOrdersForAdmin();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-semibold">All Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-neutral-600">No orders found yet.</CardContent>
          </Card>
        ) : null}

        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-neutral-700">
              <p>Buyer: {order.shippingFullName} ({order.shippingEmail})</p>
              <p>Status: {order.status}</p>
              <p>Total: {formatINR(order.totalAmount)}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
