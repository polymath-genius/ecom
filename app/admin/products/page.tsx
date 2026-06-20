import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryAttributeFields } from "@/components/category-attribute-fields";
import { requireUserWithRole } from "@/lib/dashboard-auth";
import {
  adminCreateProduct,
  getCategoryAttributeTemplates,
  getSellerListingFormOptions,
} from "@/lib/marketplace";

export default async function AdminProductsPage() {
  await requireUserWithRole(["admin"]);
  const formOptions = await getSellerListingFormOptions();

  async function createProduct(formData: FormData) {
    "use server";
    await requireUserWithRole(["admin"]);

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = String(formData.get("price") || "0");
    const stock = String(formData.get("stock") || "0");
    const categoryId = String(formData.get("categoryId") || "").trim();

    if (!name || Number.isNaN(Number(price)) || !categoryId) {
      return;
    }

    const templateRows = await getCategoryAttributeTemplates(categoryId);
    const attributes = templateRows
      .map((template) => ({
        key: template.key,
        value: String(formData.get(`attr_${template.key}`) || "").trim(),
      }))
      .filter((item) => item.value);

    await adminCreateProduct({
      name,
      description,
      price,
      stock,
      categoryId,
      attributes,
    });
    revalidatePath("/admin/products");
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Product (Admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createProduct} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Product Name</label>
                <Input name="name" required placeholder="Product title" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea name="description" className="w-full rounded-md border px-3 py-2 text-sm" rows={4} placeholder="Description" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Base Price</label>
                  <Input name="price" type="number" min="0" step="0.01" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Stock</label>
                  <Input name="stock" type="number" min="0" step="1" required />
                </div>
              </div>
              <CategoryAttributeFields
                categories={formOptions.categories}
                templates={formOptions.templates}
              />
              <Button type="submit" className="w-full sm:w-auto">Create Product</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
