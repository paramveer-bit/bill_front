"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/ProductsTab";
import { CategoriesTab } from "@/components/CategoriesTab";
import { type Category, type Product } from "@/lib/types";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers";
import { Loader2 } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_BASEURL;

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ── fetch helpers (exported so child tabs can call refetch) ──────────────────

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axios.get(`${BASE}/categories`);
      setCategories(res.data.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.errors?.[0]?.message ||
          "Failed to load categories",
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get(`${BASE}/products`);
      setProducts(res.data.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.errors?.[0]?.message || "Failed to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const isLoading = loadingCategories || loadingProducts;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-8 pt-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground mt-1">
                Manage your product inventory and categories
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            )}
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">
                Products
                {!loadingProducts && (
                  <span className="ml-2 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {products.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="categories">
                Categories
                {!loadingCategories && (
                  <span className="ml-2 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {categories.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsTab
                products={products}
                categories={categories}
                loading={loadingProducts}
                onProductsChange={setProducts}
                onRefresh={fetchProducts}
              />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesTab
                categories={categories}
                products={products}
                // loading={loadingCategories}
                onCategoriesChange={setCategories}
                onProductsChange={setProducts}
                // onRefresh={fetchCategories}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
