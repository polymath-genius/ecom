"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const { fetchStatus, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const throwIfClerkError = (result: { error: unknown | null } | undefined) => {
    if (result?.error) {
      throw result.error;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fetchStatus === "fetching") return;

    const target = email.trim();
    if (!target) {
      setError("Please enter an email address.");
      return;
    }

    try {
      setError("");
      const createResult = await signIn.create({ identifier: target });
      throwIfClerkError(createResult);

      const sendResult = await signIn.emailCode.sendCode({ emailAddress: target });
      throwIfClerkError(sendResult);

      router.push(`/verify-otp?flow=signin&via=email&target=${encodeURIComponent(target)}`);
    } catch (err: unknown) {
      console.error("Error occurred while signing in:", err);
      const message = (err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)
        ? (err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.longMessage || (err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.message
        : "Unable to send OTP.") || "Unable to send OTP.";
      if (String(message).toLowerCase().includes("sign up") || String(message).toLowerCase().includes("not found")) {
        router.push(`/sign-up?email=${encodeURIComponent(target)}`);
        return;
      }
      setError(message);
    }
  };

  const handleGoogleAuth = async () => {
    if (fetchStatus === "fetching") return;

    try {
      setError("");
      const ssoResult = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectCallbackUrl: "/sso-callback/sign-in",
      });
      throwIfClerkError(ssoResult);
    } catch (err: unknown) {
      console.error("Google sign in failed:", err);
      const message = err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)
        ? ((err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.longMessage || (err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.message || "Unable to continue with Google.")
        : "Unable to continue with Google.";
      setError(message);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-amber-50 via-rose-50 to-cyan-50 px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl backdrop-blur">
        <div className="grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-neutral-900 to-neutral-700 p-10 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-amber-300">ShopHub Auth</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Welcome Back</h1>
              <p className="mt-4 text-neutral-200">
                Sign in securely with your email OTP.
              </p>
            </div>
            <p className="text-sm text-neutral-300">Fast checkout, order tracking, and saved carts.</p>
          </div>

          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pt-8 sm:pt-10">
              <CardTitle className="text-3xl font-semibold tracking-tight text-neutral-900">Sign in</CardTitle>
              <p className="text-sm text-neutral-600">Use email OTP to sign in.</p>
            </CardHeader>

            <CardContent className="pb-10">
              <Button type="button" variant="outline" className="mb-5 h-11 w-full" onClick={handleGoogleAuth} disabled={fetchStatus === "fetching"}>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {fetchStatus === "fetching" ? "Please wait..." : "Continue with Google"}
              </Button>

              <div className="mb-5 flex items-center gap-3 text-xs text-neutral-400">
                <div className="h-px flex-1 bg-neutral-200" />
                <span>or continue with email OTP</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <form className="space-y-4" onSubmit={submit}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div id="clerk-captcha" className="min-h-8" />

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button type="submit" className="h-11 w-full text-base" disabled={fetchStatus === "fetching"}>
                  {fetchStatus === "fetching" ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>

              <p className="mt-4 text-xs text-neutral-500">
                Email OTP and Google sign-in are enabled.
              </p>

              <p className="mt-6 text-sm text-neutral-600">
                New here?{" "}
                <Link href="/sign-up" className="font-semibold text-neutral-900 underline underline-offset-4">
                  Create account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
