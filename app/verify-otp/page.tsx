"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Suspense, useState } from "react";

function VerifyOtpPageContent() {

    const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
    const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const flow = searchParams.get("flow") === "signin" ? "signin" : "signup";
    const rawTarget = searchParams.get("target") || "";
    const target = rawTarget ? decodeURIComponent(rawTarget) : "your email";
    const isFetching = signUpFetchStatus === "fetching" || signInFetchStatus === "fetching";

    const throwIfClerkError = (result: { error: unknown | null } | undefined) => {
      if (result?.error) {
        throw result.error;
      }
    };

    const extractErrorMessage = (err: unknown) => {
      if (err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)) {
        const errs = err.errors as Array<{ longMessage?: string; message?: string }>;
        return errs[0]?.longMessage || errs[0]?.message || "Something went wrong.";
      }
      return "Something went wrong.";
    };

    const isAlreadyVerifiedError = (err: unknown) => {
      const msg = String(extractErrorMessage(err)).toLowerCase();
      return msg.includes("already verified");
    };

    const finalizeSignUpIfPossible = async () => {
      if (!signUp.createdSessionId) {
        const missing = Array.isArray(signUp?.missingFields) ? signUp.missingFields.join(", ") : "";
        if (missing) {
          setError(`Verification succeeded, but signup is missing required fields: ${missing}.`);
          return false;
        }

        if (rawTarget) {
          router.push(`/sign-in?email=${encodeURIComponent(target)}`);
          return true;
        }

        setError("Verification succeeded, but no session was created. Please sign in again.");
        return false;
      }

      const finalizeResult = await signUp.finalize();
      throwIfClerkError(finalizeResult);
      router.push("/");
      return true;
    };

    const finalizeSignInIfPossible = async () => {
      if (!signIn.createdSessionId) {
        setError("Verification succeeded, but no session was created. Please request a new OTP.");
        return false;
      }

      const finalizeResult = await signIn.finalize();
      throwIfClerkError(finalizeResult);
      router.push("/");
      return true;
    };

    async function verify(e: React.FormEvent) {
        e.preventDefault();
        if(isFetching){
            return;
        }

        try {
            setError("");
            const code = verificationCode.trim();

            if (flow === "signup") {
              const verifyResult = await signUp.verifications.verifyEmailCode({ code });
              throwIfClerkError(verifyResult);
              const handled = await finalizeSignUpIfPossible();
              if (!handled) return;
            } else {
              const verifyResult = await signIn.emailCode.verifyCode({ code });
              throwIfClerkError(verifyResult);
              const handled = await finalizeSignInIfPossible();
              if (!handled) return;
            }

            return;
        }
        catch (err: unknown) {
            console.error("Error occurred while verifying code:", err);

            if (isAlreadyVerifiedError(err)) {
              try {
                if (flow === "signup") {
                  const handled = await finalizeSignUpIfPossible();
                  if (!handled) return;
                } else {
                  const handled = await finalizeSignInIfPossible();
                  if (!handled) return;
                }
                return;
              } catch (finalizeErr: unknown) {
                const missing = Array.isArray(signUp?.missingFields) ? signUp.missingFields.join(", ") : "";
                const finalizeMessage = extractErrorMessage(finalizeErr);
                setError(
                  missing
                    ? `Verification is complete, but signup is missing required fields: ${missing}.`
                    : finalizeMessage
                );
                return;
              }
            }

            setError(extractErrorMessage(err) || "Invalid OTP code.");
        }
    }

    async function resendCode() {
      if (isFetching) return;

      try {
        setError("");

        if (flow === "signup") {
          const resendResult = await signUp.verifications.sendEmailCode();
          throwIfClerkError(resendResult);
        } else {
          const resendResult = await signIn.emailCode.sendCode();
          throwIfClerkError(resendResult);
        }
      } catch (err: unknown) {
        console.error("Error occurred while resending code:", err);
        const message = err && typeof err === "object" && "errors" in err && Array.isArray(err.errors)
          ? ((err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.longMessage || (err.errors as Array<{ longMessage?: string; message?: string }>)[0]?.message || "Unable to resend OTP.")
          : "Unable to resend OTP.";
        setError(message);
      }
    }

  return (
    <main className="min-h-screen bg-linear-to-br from-cyan-50 via-emerald-50 to-amber-50 px-4 py-10 sm:py-16">
      <section className="mx-auto w-full max-w-xl">
        <Card className="rounded-3xl border-neutral-200 bg-white/95 shadow-2xl">
          <CardHeader className="pb-3 pt-8 text-center">
            <CardTitle className="text-3xl font-semibold tracking-tight text-neutral-900">Verify OTP</CardTitle>
            <p className="mt-2 text-sm text-neutral-500">
              Enter the one-time code sent to <span className="font-medium text-neutral-700">{target}</span>
            </p>
          </CardHeader>

          <CardContent className="pb-10">
            <form className="space-y-4" onSubmit={verify}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">One-time password</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  required
                  className="h-11 tracking-[0.2em]"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" className="h-11 w-full text-base" disabled={isFetching}>
                {isFetching ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <Link href="/sign-in" className="font-medium text-neutral-700 hover:text-neutral-900">
                Back to sign in
              </Link>
              <button
                type="button"
                onClick={resendCode}
                className="font-medium text-neutral-700 hover:text-neutral-900"
                disabled={isFetching}
              >
                Resend OTP
              </button>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              If your code expires, use Resend OTP to request a fresh verification code.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-linear-to-br from-cyan-50 via-emerald-50 to-amber-50" />}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
