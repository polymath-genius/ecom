"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description?: string;
      order_id: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: {
        color?: string;
      };
      modal?: {
        ondismiss?: () => void;
      };
    }) => { open: () => void };
  }
}

const loadRazorpayScript = async () => {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.1;
  const finalTotal = total + shipping + tax;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderComplete) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, orderComplete, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      router.push("/sign-in?redirect_url=/checkout");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const shippingPayload = {
        shippingFullName: `${String(formData.get("firstName") || "").trim()} ${String(
          formData.get("lastName") || ""
        ).trim()}`.trim(),
        shippingEmail: String(formData.get("email") || "").trim(),
        shippingPhone: String(formData.get("phone") || "").trim(),
        shippingAddressLine1: String(formData.get("address") || "").trim(),
        shippingAddressLine2: String(formData.get("address2") || "").trim(),
        shippingCity: String(formData.get("city") || "").trim(),
        shippingState: String(formData.get("state") || "").trim(),
        shippingPostalCode: String(formData.get("zip") || "").trim(),
        shippingCountry: String(formData.get("country") || "").trim(),
      };

      const cartItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const orderInitResponse = await fetch("/api/checkout/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });

      const orderInitData = (await orderInitResponse.json()) as {
        keyId?: string;
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };

      if (!orderInitResponse.ok || !orderInitData.keyId || !orderInitData.razorpayOrderId || !orderInitData.amount) {
        throw new Error(orderInitData.error || "Unable to initialize payment");
      }

      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const razorpay = new window.Razorpay({
        key: orderInitData.keyId,
        amount: orderInitData.amount,
        currency: orderInitData.currency || "INR",
        name: "E-com Store",
        description: "Complete your order payment",
        order_id: orderInitData.razorpayOrderId,
        prefill: {
          name: shippingPayload.shippingFullName,
          email: shippingPayload.shippingEmail,
          contact: shippingPayload.shippingPhone,
        },
        theme: {
          color: "#111827",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...shippingPayload,
                cartItems,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = (await verifyResponse.json()) as { error?: string };

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            await fetch("/api/cart", { method: "DELETE" });

            setIsProcessing(false);
            setOrderComplete(true);
            clearCart();

            setTimeout(() => {
              router.push("/");
            }, 3000);
          } catch (verifyError: unknown) {
            setIsProcessing(false);
            const message = verifyError instanceof Error ? verifyError.message : "Payment verification failed";
            setError(message);
          }
        },
      });

      razorpay.open();
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : "Failed to place order";
      setError(message);
    }
  };

  if (!isHydrated || (items.length === 0 && !orderComplete)) {
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="mx-auto h-24 w-24 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed and saved.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input name="firstName" placeholder="John" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input name="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input name="address" placeholder="123 Main St" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <Input name="address2" placeholder="Apt 4B" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <Input name="city" placeholder="New York" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <Input name="state" placeholder="NY" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <Input name="zip" placeholder="10001" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <Input name="country" placeholder="United States" required />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} x {formatINR(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatINR(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : formatINR(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>{formatINR(tax)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatINR(finalTotal)}</span>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay with Razorpay"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By placing your order, you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
