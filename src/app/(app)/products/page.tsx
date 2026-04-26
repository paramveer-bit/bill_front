"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTab } from "@/components/product/ProductTab";
import { CategoriesTab } from "@/components/CategoriesTab";
import { type Category, type Product } from "@/lib/types";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers/toast";
import Header from "@/components/Header";
import { useApi } from "@/hooks/useApi";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const api = useApi();
  // ── fetch helpers (exported so child tabs can call refetch) ──────────────────

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get(`${BASE}/categories?flat=true`);
      setCategories(res.data.data.data);
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
      const res = await api.get(`${BASE}/products`);
      setProducts(res.data.data.data);
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
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <Header
        title="Products"
        description="Manage your product inventory and categories"
      />

      <div className="p-6">
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
    </div>
  );
}
