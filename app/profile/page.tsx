import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  CreditCard,
  Heart,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { getRecentOrdersForUser } from "@/lib/marketplace";
import { formatINR } from "@/lib/utils";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const normalizePhone = (input: string) => input.trim().replace(/\s+/g, " ");

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/profile");
  }

  async function savePhone(formData: FormData) {
    "use server";

    const { userId: activeUserId } = await auth();
    if (!activeUserId) {
      redirect("/sign-in?redirect_url=/profile");
    }

    const phoneValue = normalizePhone(String(formData.get("phone") || ""));
    const client = await clerkClient();
    await client.users.updateUserMetadata(activeUserId, {
      publicMetadata: {
        phone: phoneValue,
      },
    });

    redirect("/profile");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/profile");
  }

  const metadataPhone =
    typeof user.publicMetadata?.phone === "string" ? user.publicMetadata.phone : "";
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.primaryEmailAddress?.emailAddress ||
    "Customer";
  const email = user.primaryEmailAddress?.emailAddress || "No email on file";
  const phone = user.primaryPhoneNumber?.phoneNumber || metadataPhone || "";
  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));
  const completionParts = [
    Boolean(user.firstName || user.lastName),
    Boolean(user.primaryEmailAddress?.emailAddress),
    Boolean(phone),
  ];
  const completion = Math.max(34, Math.round((completionParts.filter(Boolean).length / completionParts.length) * 100));
  const initials = getInitials(fullName);
  const recentOrders = await getRecentOrdersForUser(user.id);

  return (
    <main className="min-h-screen bg-linear-to-br from-cyan-50 via-emerald-50 to-amber-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl backdrop-blur">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="mb-4 inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                <Star className="mr-2 h-3.5 w-3.5" /> Gold Member
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">{fullName}</h1>
              <p className="mt-2 text-sm text-neutral-600">Manage your profile, addresses, and order activity in one place.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">Session user: {user.id.slice(0, 10)}...</Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">Email OTP enabled</Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">Member since {memberSince}</Badge>
              </div>
            </div>

            <Card className="border-neutral-200/80 bg-white/85 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center justify-between text-sm text-neutral-700">
                  <span>{completion}% complete</span>
                  <span>{phone ? "Profile is healthy" : "Add phone number"}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-neutral-900" style={{ width: `${completion}%` }} />
                </div>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/orders">Track Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="rounded-3xl border-neutral-200/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={savePhone} className="grid gap-4 sm:grid-cols-2">
                <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
                <Input defaultValue={fullName} className="h-10" readOnly />
                </div>
                <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
                <Input defaultValue={email} className="h-10" readOnly />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Phone</label>
                  <Input
                    name="phone"
                    defaultValue={phone}
                    className="h-10"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="w-full sm:w-auto">Save phone number</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-neutral-200/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/track-order" className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50">
                <span className="flex items-center gap-2 text-sm font-medium text-neutral-800"><Package className="h-4 w-4" /> Track an order</span>
                <span className="text-neutral-500">Open</span>
              </Link>
              <Link href="/wishlist" className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50">
                <span className="flex items-center gap-2 text-sm font-medium text-neutral-800"><Heart className="h-4 w-4" /> Wishlist</span>
                <span className="text-neutral-500">Open</span>
              </Link>
              <button className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50">
                <span className="flex items-center gap-2 text-sm font-medium text-neutral-800"><ShieldCheck className="h-4 w-4" /> Security settings</span>
                <span className="text-neutral-500">Manage</span>
              </button>
              <Link href="/seller" className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50">
                <span className="text-sm font-medium text-neutral-800">Seller Dashboard</span>
                <span className="text-neutral-500">Open</span>
              </Link>
              <Link href="/admin" className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left hover:bg-neutral-50">
                <span className="text-sm font-medium text-neutral-800">Admin Dashboard</span>
                <span className="text-neutral-500">Open</span>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-neutral-200/80 bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Saved Addresses (Session)</CardTitle>
              <Button variant="outline" size="sm" disabled>Add Address</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                No saved addresses found for this session user yet.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-neutral-200/80 bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Recent Orders (Session)</CardTitle>
              <Button variant="outline" size="sm" asChild><Link href="/orders">View All</Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-600">
                  No order history available yet for {fullName}.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-neutral-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 capitalize">{order.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-neutral-600">
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      <span className="font-medium text-neutral-900">{formatINR(Number(order.totalAmount))}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-neutral-200/80 bg-white/90">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-neutral-100 p-2"><User className="h-5 w-5 text-neutral-700" /></div>
              <div>
                <p className="text-xs text-neutral-500">Account Type</p>
                <p className="text-sm font-semibold text-neutral-900">Personal</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-neutral-200/80 bg-white/90">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-neutral-100 p-2"><Phone className="h-5 w-5 text-neutral-700" /></div>
              <div>
                <p className="text-xs text-neutral-500">Contact</p>
                <p className="text-sm font-semibold text-neutral-900">{phone ? "Saved" : "Email only"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-neutral-200/80 bg-white/90">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-neutral-100 p-2"><MapPin className="h-5 w-5 text-neutral-700" /></div>
              <div>
                <p className="text-xs text-neutral-500">Addresses</p>
                <p className="text-sm font-semibold text-neutral-900">0 Saved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-neutral-200/80 bg-white/90">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-neutral-100 p-2"><CreditCard className="h-5 w-5 text-neutral-700" /></div>
              <div>
                <p className="text-xs text-neutral-500">Payments</p>
                <p className="text-sm font-semibold text-neutral-900">Not added</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <p className="flex items-center justify-center gap-2 text-center text-sm text-neutral-500">
          <CalendarDays className="h-4 w-4" /> Last updated for your session on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </main>
  );
}