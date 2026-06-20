import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import { getSellerEarnings } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

export default async function SellerEarningsPage() {
  const { user } = await requireUserWithRole(["seller"]);
  const earnings = await getSellerEarnings(user.id);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <h1 className="text-2xl font-semibold">Earnings</h1>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader><CardTitle className="text-base">Gross Sales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatINR(earnings.grossTotal)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Paid Out</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatINR(earnings.paidOut)}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Available</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatINR(earnings.available)}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {earnings.payouts.length === 0 ? <p className="text-sm text-neutral-600">No payouts yet.</p> : null}
            {earnings.payouts.map((row) => (
              <div key={row.id} className="rounded-xl border p-3 text-sm text-neutral-700">
                <p>Amount: {formatINR(row.amount)}</p>
                <p>Status: {row.status}</p>
                <p>Note: {row.note || "-"}</p>
                <p>Created: {new Date(row.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
