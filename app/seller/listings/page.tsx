import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryAttributeFields } from "@/components/category-attribute-fields";
import { ProductNameSuggestionInput } from "@/components/product-name-suggestion-input";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import {
  createSubcategoryUnderParent,
  createOrAttachSellerListing,
  getCategoryAttributeTemplates,
  getSellerListingFormOptions,
  getSellerListings,
  updateSellerListing,
} from "@/lib/marketplace";

const saveUploadedImage = async (file: File) => {
  if (!file || file.size === 0) return "";
  if (!file.type.startsWith("image/")) return "";

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "png"}`;
  const targetPath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, bytes);

  return `/uploads/products/${fileName}`;
};

const parseImageUrls = (raw: string) => {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of raw.split(/\r?\n|,/)) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    urls.push(normalized);
  }

  return urls;
};

export default async function SellerListingsPage() {
  const { user } = await requireUserWithRole(["seller"]);
  const [listings, formOptions] = await Promise.all([
    getSellerListings(user.id),
    getSellerListingFormOptions(),
  ]);

  async function createListing(formData: FormData) {
    "use server";
    const { user: current } = await requireUserWithRole(["seller"]);

    const productName = String(formData.get("productName") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const imageUrlsInput = String(formData.get("imageUrls") || "");
    const imageFiles = formData.getAll("imageFiles");
    const price = String(formData.get("price") || "0");
    const stock = String(formData.get("stock") || "0");
    const categoryId = String(formData.get("categoryId") || "").trim();
    const newSubcategoryName = String(formData.get("newSubcategoryName") || "").trim();
    const selectedProductId = String(formData.get("selectedProductId") || "").trim();

    if (!productName || Number.isNaN(Number(price))) return;
    if (!selectedProductId && !categoryId && !newSubcategoryName) return;

    let effectiveCategoryId = categoryId;

    if (newSubcategoryName) {
      const options = await getSellerListingFormOptions();
      const selected = options.categories.find((x) => x.id === categoryId);
      const topCategoryId = selected
        ? selected.parentCategoryId || selected.id
        : "";

      if (topCategoryId) {
        const created = await createSubcategoryUnderParent({
          parentCategoryId: topCategoryId,
          name: newSubcategoryName,
        });
        effectiveCategoryId = created.id;
      }
    }

    if (!selectedProductId && !effectiveCategoryId) return;

    const templateRows = effectiveCategoryId
      ? await getCategoryAttributeTemplates(effectiveCategoryId)
      : [];
    const attributes = templateRows
      .map((template) => ({
        key: template.key,
        value: String(formData.get(`attr_${template.key}`) || "").trim(),
      }))
      .filter((item) => item.value);

    const uploadedImageUrls = (
      await Promise.all(
        imageFiles
          .filter((entry): entry is File => entry instanceof File)
          .map((file) => saveUploadedImage(file))
      )
    ).filter(Boolean);
    const linkedImageUrls = parseImageUrls(imageUrlsInput);
    const imageUrls = [...uploadedImageUrls, ...linkedImageUrls];

    await createOrAttachSellerListing({
      clerkUserId: current.id,
      email: current.primaryEmailAddress?.emailAddress || "seller@example.com",
      displayName: [current.firstName, current.lastName].filter(Boolean).join(" ") || current.primaryEmailAddress?.emailAddress || "Seller",
      productName,
      description,
      imageUrl: imageUrls[0] || "",
      imageUrls,
      price,
      stock,
      categoryId: effectiveCategoryId,
      attributes,
      selectedProductId,
    });

    revalidatePath("/seller/listings");
    revalidatePath("/seller");
    revalidatePath("/admin/listings");
  }

  async function updateListing(formData: FormData) {
    "use server";
    const { user: current } = await requireUserWithRole(["seller"]);

    const listingId = String(formData.get("listingId") || "");
    const price = String(formData.get("price") || "0");
    const stock = String(formData.get("stock") || "0");
    const description = String(formData.get("description") || "").trim();
    const imageUrlsInput = String(formData.get("imageUrls") || "");
    const imageFiles = formData.getAll("imageFiles");
    const categoryId = String(formData.get("categoryId") || "").trim();

    if (!listingId) return;

    const templateRows = categoryId ? await getCategoryAttributeTemplates(categoryId) : [];
    const attributes = templateRows
      .map((template) => ({
        key: template.key,
        value: String(formData.get(`attr_${template.key}`) || "").trim(),
      }))
      .filter((item) => item.value);

    const uploadedImageUrls = (
      await Promise.all(
        imageFiles
          .filter((entry): entry is File => entry instanceof File)
          .map((file) => saveUploadedImage(file))
      )
    ).filter(Boolean);
    const linkedImageUrls = parseImageUrls(imageUrlsInput);
    const imageUrls = [...uploadedImageUrls, ...linkedImageUrls];

    await updateSellerListing({
      clerkUserId: current.id,
      listingId,
      price,
      stock,
      description,
      imageUrl: imageUrls[0] || "",
      imageUrls,
      categoryId,
      attributes,
    });

    revalidatePath("/seller/listings");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold">Seller Listings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Create Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createListing} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Product Name</label>
                  <ProductNameSuggestionInput />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Price</label>
                  <Input name="price" type="number" min="0" step="0.01" required />
                </div>
              </div>
              <CategoryAttributeFields
                categories={formOptions.categories}
                templates={formOptions.templates}
                showNewSubcategoryInput
                requireExplicitSelection
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea name="description" className="w-full rounded-md border px-3 py-2 text-sm" rows={4} placeholder="Describe the product clearly" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Image URLs (optional)</label>
                <textarea
                  name="imageUrls"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  placeholder={"https://example.com/product-image-1.jpg\nhttps://example.com/product-image-2.jpg"}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Or Upload Images (optional)</label>
                <Input name="imageFiles" type="file" accept="image/*" multiple />
              </div>
              <div className="max-w-sm">
                <label className="mb-1 block text-sm font-medium">Stock</label>
                <Input name="stock" type="number" min="0" step="1" required />
              </div>
              <Button type="submit">Create Listing</Button>
              <p className="text-xs text-neutral-500">
                Listing creates a new product request and sends it for admin approval.
              </p>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          {listings.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-neutral-600">No listings yet.</CardContent></Card>
          ) : null}

          {listings.map((listing) => (
            <Card key={listing.listingId}>
              <CardContent className="space-y-3 p-4 text-sm">
                <p className="font-medium text-neutral-900">{listing.productName}</p>
                <p className="text-xs text-neutral-600">Category: {listing.categoryName}</p>
                <p>Status: {listing.status}</p>
                {listing.adminNote ? <p>Admin note: {listing.adminNote}</p> : null}
                <form action={updateListing} className="space-y-3">
                  <input type="hidden" name="listingId" value={listing.listingId} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input name="price" defaultValue={listing.price} type="number" step="0.01" min="0" required />
                    <Input name="stock" defaultValue={listing.stock} type="number" min="0" step="1" required />
                  </div>
                  <CategoryAttributeFields
                    categories={formOptions.categories}
                    templates={formOptions.templates}
                    initialCategoryId={listing.categoryId}
                    initialAttributes={listing.attributes || []}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      rows={3}
                      defaultValue={listing.productDescription || ""}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Image URLs</label>
                    <textarea
                      name="imageUrls"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      rows={3}
                      defaultValue={listing.imageUrl || ""}
                      placeholder={"https://example.com/product-image-1.jpg\nhttps://example.com/product-image-2.jpg"}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Or Upload New Images</label>
                    <Input name="imageFiles" type="file" accept="image/*" multiple />
                  </div>
                  <div>
                    <Button type="submit" variant="outline">Update Listing</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
