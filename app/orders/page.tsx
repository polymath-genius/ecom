import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDetailedOrdersForUser } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

type OrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

type OrderGroup = {
  orderId: string;
  createdAt: Date;
  orderStatus: string;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  totalAmount: string;
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentProvider: string | null;
  paymentStatus: string | null;
  paymentProviderRef: string | null;
  paymentAmount: string | null;
  paymentPaidAt: Date | null;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    imageUrl: string;
  }>;
};

const placeholderImage =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&h=500&fit=crop";

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/orders");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/orders");
  }

  const params = searchParams ? await searchParams : {};
  const query = (params.q || "").trim().toLowerCase();

  const rows = await getDetailedOrdersForUser(user.id);

  const grouped = new Map<string, OrderGroup>();

  for (const row of rows) {
    if (!grouped.has(row.orderId)) {
      grouped.set(row.orderId, {
        orderId: row.orderId,
        createdAt: row.createdAt,
        orderStatus: row.orderStatus,
        subtotal: row.subtotal,
        taxAmount: row.taxAmount,
        shippingAmount: row.shippingAmount,
        discountAmount: row.discountAmount,
        totalAmount: row.totalAmount,
        shippingFullName: row.shippingFullName,
        shippingEmail: row.shippingEmail,
        shippingPhone: row.shippingPhone,
        shippingAddressLine1: row.shippingAddressLine1,
        shippingAddressLine2: row.shippingAddressLine2,
        shippingCity: row.shippingCity,
        shippingState: row.shippingState,
        shippingPostalCode: row.shippingPostalCode,
        shippingCountry: row.shippingCountry,
        paymentProvider: row.paymentProvider,
        paymentStatus: row.paymentStatus,
        paymentProviderRef: row.paymentProviderRef,
        paymentAmount: row.paymentAmount,
        paymentPaidAt: row.paymentPaidAt,
        items: [],
      });
    }

    const order = grouped.get(row.orderId)!;
    order.items.push({
      productId: row.productId,
      productName: row.productName,
      sku: row.sku,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      lineTotal: row.lineTotal,
      imageUrl: row.imageUrl || placeholderImage,
    });
  }

  const orders = Array.from(grouped.values()).filter((order) => {
    if (!query) return true;

    const haystack = [
      order.orderId,
      order.orderStatus,
      order.shippingFullName,
      order.shippingEmail,
      order.paymentProvider || "",
      order.paymentProviderRef || "",
      ...order.items.map((item) => item.productName),
      ...order.items.map((item) => item.sku),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Track Orders / All Recent Orders</h1>
          <Link href="/profile" className="text-sm text-neutral-600 hover:text-neutral-900">
            Back to Profile
          </Link>
        </div>

        <form className="rounded-2xl border bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="q">
            Search by order id, product name, SKU, payment ref
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              defaultValue={params.q || ""}
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
              placeholder="Type to search orders"
            />
            <button type="submit" className="h-10 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white">
              Search
            </button>
          </div>
        </form>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-neutral-600">No orders found.</CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="border-b bg-neutral-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-base">Order #{order.orderId.slice(0, 8).toUpperCase()}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize" variant="secondary">{order.orderStatus}</Badge>
                    <span className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-5">
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold text-neutral-800">Products</h2>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={`${order.orderId}-${item.productId}-${item.sku}`} className="flex gap-3 rounded-xl border p-3">
                        <Link href={`/products/${item.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-neutral-100">
                          <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900">{item.productName}</p>
                          <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit: {formatINR(item.unitPrice)}</span>
                            <span className="font-medium text-neutral-900">Line: {formatINR(item.lineTotal)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <h3 className="mb-2 text-sm font-semibold text-neutral-800">Payment Details</h3>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>Provider: <span className="font-medium capitalize text-neutral-900">{order.paymentProvider || "N/A"}</span></p>
                      <p>Status: <span className="font-medium capitalize text-neutral-900">{order.paymentStatus || "N/A"}</span></p>
                      <p>Ref: <span className="font-medium text-neutral-900">{order.paymentProviderRef || "N/A"}</span></p>
                      <p>Paid Amount: <span className="font-medium text-neutral-900">{formatINR(order.paymentAmount || order.totalAmount)}</span></p>
                      <p>Paid At: <span className="font-medium text-neutral-900">{order.paymentPaidAt ? new Date(order.paymentPaidAt).toLocaleString() : "N/A"}</span></p>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <h3 className="mb-2 text-sm font-semibold text-neutral-800">Shipping & Totals</h3>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>Name: <span className="font-medium text-neutral-900">{order.shippingFullName}</span></p>
                      <p>Email: <span className="font-medium text-neutral-900">{order.shippingEmail}</span></p>
                      <p>Phone: <span className="font-medium text-neutral-900">{order.shippingPhone || "N/A"}</span></p>
                      <p>
                        Address: <span className="font-medium text-neutral-900">{order.shippingAddressLine1}{order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}, {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ""} {order.shippingPostalCode}, {order.shippingCountry}</span>
                      </p>
                      <p>Subtotal: <span className="font-medium text-neutral-900">{formatINR(order.subtotal)}</span></p>
                      <p>Tax: <span className="font-medium text-neutral-900">{formatINR(order.taxAmount)}</span></p>
                      <p>Shipping: <span className="font-medium text-neutral-900">{formatINR(order.shippingAmount)}</span></p>
                      <p>Discount: <span className="font-medium text-neutral-900">{formatINR(order.discountAmount)}</span></p>
                      <p className="pt-1 text-base">Total: <span className="font-semibold text-neutral-900">{formatINR(order.totalAmount)}</span></p>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
