"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { showErrorToast } from "@/lib/helpers/toast";
import { type Product, buildCategoryTree } from "@/lib/types";

import { CategoryNode } from "./CategoryNode";
import { ProductFormContent } from "./ProductFormContent";
import { type ProductFormState } from "@/lib/types/forms";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

const defaultForm: ProductFormState = {
  sku: "",
  name: "",
  baseUnit: "Pcs",
  currentSellPrice: "",
  taxRate: "18",
  isStockItem: true,
  categoryId: "0",
  unitRows: [],
};

export function ProductsTab({
  products,
  categories,
  loading,
  onProductsChange,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [threshold, setThreshold] = useState(20);

  const categoryTree = buildCategoryTree(categories);

  // Filter Engine
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const totalQty =
        p.totalStockPcs ??
        p.purchaseBatches?.reduce((sum, b) => sum + b.qtyRemaining, 0) ??
        0;
      const matchesStock = showLowStockOnly ? totalQty <= threshold : true;
      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, showLowStockOnly, threshold]);

  const productsByCategory = useMemo(() => {
    return filteredProducts.reduce((acc: any, p: Product) => {
      const catId = p.categoryId || "uncategorized";
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(p);
      return acc;
    }, {});
  }, [filteredProducts]);

  const buildPayload = (f: ProductFormState) => ({
    ...f,
    currentSellPrice: parseFloat(f.currentSellPrice) || 0,
    taxRate: parseFloat(f.taxRate) || 0,
    categoryId: f.categoryId === "0" ? null : f.categoryId,
    // Converting form strings to integer numbers for API
    unitConversions: f.unitRows.map((u) => ({
      unitName: u.unitName,
      conversionQty: parseInt(u.conversionQty) || 1,
    })),
  });

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/products`, buildPayload(form));
      onProductsChange([...products, res.data.data]);
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch (err) {
      showErrorToast("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    setSubmitting(true);
    try {
      const res = await axios.put(
        `${BASE}/products/${editingProduct.id}`,
        buildPayload(form),
      );
      onProductsChange(
        products.map((p: Product) =>
          p.id === editingProduct.id ? res.data.data : p,
        ),
      );
      setIsEditOpen(false);
    } catch (err) {
      showErrorToast("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm Delete?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${BASE}/products/${id}`);
      onProductsChange(products.filter((p: Product) => p.id !== id));
    } catch (err) {
      showErrorToast("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku || "",
      name: p.name,
      baseUnit: p.baseUnit,
      currentSellPrice: p.currentSellPrice?.toString() || "",
      taxRate: p.taxRate?.toString() || "",
      isStockItem: p.isStockItem,
      categoryId: p.categoryId || "0",
      // Restoring Unit Rows (excluding the automatic 1:1 base unit row)
      unitRows:
        p.unitConversions
          ?.filter((uc) => uc.unitName !== p.baseUnit)
          .map((uc) => ({
            unitName: uc.unitName,
            conversionQty: uc.conversionQty.toString(),
          })) || [],
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 flex-col md:flex-row gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search catalog..."
              className="pl-10 h-10 shadow-inner bg-slate-50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-100 p-2 px-4 rounded-full border border-slate-200">
            <div className="flex items-center gap-2">
              <Switch
                checked={showLowStockOnly}
                onCheckedChange={setShowLowStockOnly}
              />
              <Label className="text-[10px] font-bold uppercase text-slate-600">
                Low Stock
              </Label>
            </div>
            {showLowStockOnly && (
              <div className="flex items-center gap-2 border-l pl-4 border-slate-300">
                <span className="text-[10px] font-black text-slate-400">
                  BELOW:
                </span>
                <Input
                  type="number"
                  className="w-16 h-7 text-xs font-black bg-white"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setForm(defaultForm)}
              className="h-10 px-6 font-bold shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Product</DialogTitle>
            </DialogHeader>
            <ProductFormContent
              form={form}
              setForm={setForm}
              categoryTree={categoryTree}
            />
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 px-1">
        {loading ? (
          <div className="flex py-32 flex-col justify-center items-center gap-3">
            <Loader2 className="animate-spin h-10 w-10 text-primary/40" />
          </div>
        ) : (
          categoryTree.map((cat) => (
            <CategoryNode
              key={cat.id}
              category={cat}
              productsByCategory={productsByCategory}
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
          </DialogHeader>
          <ProductFormContent
            form={form}
            setForm={setForm}
            categoryTree={categoryTree}
          />
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
