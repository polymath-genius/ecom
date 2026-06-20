import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { ArrowRight } from "lucide-react";

export default async function Home() {

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_right,#1f2937,#0a0a0a_55%)] text-white">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs tracking-[0.16em] text-cyan-100 uppercase">
                Curated Marketplace
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Shop smarter with products people actually love.
              </h1>
              <p className="max-w-xl text-base text-neutral-200 sm:text-lg">
                Browse verified listings across categories, compare options quickly, and discover fresh arrivals from trusted sellers.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-neutral-200 sm:text-sm">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Fast dispatch</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Secure checkout</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Easy returns</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-amber-400 text-neutral-900 hover:bg-amber-300">
                  <Link href="/products">
                    Explore Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/40 bg-transparent text-white hover:bg-white hover:text-neutral-900">
                  <Link href="/seller/listings">
                    Start Selling
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=900&fit=crop"
                    alt="Modern shopping collection"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute left-6 top-6 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-neutral-300">Trending this week</p>
                  <p className="mt-1 text-lg font-semibold text-white">{products.length} products live</p>
                </div>
                <div className="absolute bottom-6 right-6 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-neutral-200">Categories</p>
                  <p className="mt-1 text-lg font-semibold">{categories.length} collections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="shop-by-category" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Collections</p>
              <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Shop by Category</h2>
            </div>
            <Button variant="link" asChild className="px-0 text-neutral-700">
              <Link href="/#shop-by-category">
                Browse all categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="relative aspect-5/4">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="mb-2 inline-flex rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[11px] uppercase tracking-wider">
                    Collection {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Button variant="link" asChild>
              <Link href="/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over {50}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
