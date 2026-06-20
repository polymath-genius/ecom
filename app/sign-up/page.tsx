"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Suspense, useState } from "react";

function SignUpPageContent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="min-h-screen bg-linear-to-br from-cyan-50 via-emerald-50 to-amber-50 px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-2xl backdrop-blur">
        <div className="grid lg:grid-cols-2">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pt-8 sm:pt-10">
              <CardTitle className="text-3xl font-semibold tracking-tight text-neutral-900">Create account</CardTitle>
              <p className="text-sm text-neutral-600">Verify your account with email OTP.</p>
            </CardHeader>

            <CardContent className="pb-10">
              <Button type="button" variant="outline" className="mb-5 h-11 w-full">
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
              </Button>

              <div className="mb-5 flex items-center gap-3 text-xs text-neutral-400">
                <div className="h-px flex-1 bg-neutral-200" />
                <span>or continue with email OTP setup</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <form className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    required
                    className="h-11"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    required
                    className="h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div id="clerk-captcha" className="min-h-8" />

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button type="submit" className="h-11 w-full text-base">
                </Button>
              </form>

              <p className="mt-4 text-xs text-neutral-500">
                Your account will be verified using email OTP before activation.
              </p>

              <p className="mt-6 text-sm text-neutral-600">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-neutral-900 underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-neutral-900 to-neutral-700 p-10 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">New Customer</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">Let&apos;s Get You In</h2>
              <p className="mt-4 text-neutral-200">
                Create your account in seconds and verify with one code.
              </p>
            </div>
            <p className="text-sm text-neutral-300">Member perks unlock after sign up.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-linear-to-br from-cyan-50 via-emerald-50 to-amber-50" />}>
      <SignUpPageContent />
    </Suspense>
  );
}