"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/components/product-card";

const WISHLIST_STORAGE_KEY = "wishlist-product-ids";

export default function WishlistPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      setWishlistIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed)) {
        setWishlistIds(parsed.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setWishlistIds([]);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadStorefront = async () => {
      try {
        const res = await fetch("/api/storefront/products", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as { products: Product[] };
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        setProducts([]);
      }
    };

    void loadStorefront();
  }, [isHydrated]);

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const removeFromWishlist = (id: string) => {
    const next = wishlistIds.filter((x) => x !== id);
    setWishlistIds(next);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
  };

  if (!isHydrated) return null;

  if (!userId) {
    router.replace("/sign-in?redirect_url=/wishlist");
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Wishlist</h1>
          <Link href="/profile" className="text-sm text-neutral-600 hover:text-neutral-900">
            Back to Profile
          </Link>
        </div>

        {wishlistProducts.length === 0 ? (
          <Card>
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-neutral-600">Your wishlist is empty.</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <Link href={`/products/${product.id}`} className="relative block aspect-square bg-neutral-100">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </Link>
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-neutral-600">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-neutral-900">{formatINR(product.price)}</p>
                    <Button variant="outline" size="sm" onClick={() => removeFromWishlist(product.id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
