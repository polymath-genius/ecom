"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const WISHLIST_STORAGE_KEY = "wishlist-product-ids";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  category: string;
  rootCategory?: string;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      setIsWishlisted(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) return;
      setIsWishlisted(parsed.includes(product.id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product.id]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    let current: string[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          current = parsed.filter((id): id is string => typeof id === "string");
        }
      } catch {
        current = [];
      }
    }

    const next = current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id];

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    setIsWishlisted(next.includes(product.id));
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
            </div>
          </div>
          {product.rating!>0&& (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating!) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              {product.reviews && (
                <span className="text-sm text-gray-500 ml-2">
                  ({product.reviews})
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {product.price}
            </span>
            <Button
              size="sm"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
          {product.rating!<=0&&(
            <div className="opacity-0 flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating!) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              {product.reviews && (
                <span className="text-sm text-gray-500 ml-2">
                  ({product.reviews})
                </span>
              )}
            </div>
          )}
          <div className="bg-white border border-black">
          </div>
        </div>
      </div>
    </Link>
  );
}
