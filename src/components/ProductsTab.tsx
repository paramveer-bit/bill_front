"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tags,
  Check,
  ChevronRight,
  FolderOpen,
  Folder,
  Loader2,
  X,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers";
import {
  type Category,
  type Product,
  buildCategoryTree,
  getCategoryLabel,
} from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_BASEURL;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onProductsChange: (products: Product[]) => void;
  onRefresh: () => void;
}

// ─── Form type ────────────────────────────────────────────────────────────────

type UnitRow = { unitName: string; conversionQty: string };

type ProductForm = {
  sku: string;
  name: string;
  baseUnit: string;
  currentSellPrice: string;
  taxRate: string;
  isStockItem: boolean;
  categoryId: string;
  unitRows: UnitRow[];
};

const defaultForm: ProductForm = {
  sku: "",
  name: "",
  baseUnit: "Pcs",
  currentSellPrice: "",
  taxRate: "18",
  isStockItem: true,
  categoryId: "0",
  unitRows: [],
};

// ─── Category Select ──────────────────────────────────────────────────────────

function ProductCategorySelect({
  value,
  onChange,
  categoryTree,
}: {
  value: string;
  onChange: (v: string) => void;
  categoryTree: Category[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select category (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">No Category</SelectItem>
        {categoryTree.map((parent) =>
          parent.children && parent.children.length > 0 ? (
            <SelectGroup key={parent.id}>
              <SelectLabel className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <FolderOpen className="h-3 w-3" />
                {parent.name}
              </SelectLabel>
              {parent.children.map((child) => (
                <SelectItem key={child.id} value={child.id} className="pl-6">
                  <span className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    {child.name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            <SelectItem key={parent.id} value={parent.id}>
              <span className="flex items-center gap-1">
                <Folder className="h-3 w-3 text-muted-foreground" />
                {parent.name}
              </span>
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}

// ─── Unit Conversions Editor ──────────────────────────────────────────────────

function UnitConversionsEditor({
  baseUnit,
  rows,
  onChange,
}: {
  baseUnit: string;
  rows: UnitRow[];
  onChange: (rows: UnitRow[]) => void;
}) {
  const addRow = () => onChange([...rows, { unitName: "", conversionQty: "" }]);

  const updateRow = (i: number, field: keyof UnitRow, value: string) => {
    const updated = rows.map((r, idx) =>
      idx === i ? { ...r, [field]: value } : r,
    );
    onChange(updated);
  };

  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Unit Conversions</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" />
          Add Unit
        </Button>
      </div>

      {/* Base unit — always shown, not removable */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-dashed">
        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium flex-1">{baseUnit || "Pcs"}</span>
        <span className="text-xs text-muted-foreground">Base unit (×1)</span>
      </div>

      {/* Additional units */}
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Unit name (e.g. Case)"
            value={row.unitName}
            onChange={(e) => updateRow(i, "unitName", e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground shrink-0">=</span>
          <Input
            type="number"
            placeholder="Qty"
            value={row.conversionQty}
            onChange={(e) => updateRow(i, "conversionQty", e.target.value)}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground shrink-0">
            {baseUnit || "Pcs"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => removeRow(i)}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          e.g. 1 Case = 300 {baseUnit || "Pcs"}, 1 Ladi = 12 {baseUnit || "Pcs"}
        </p>
      )}
    </div>
  );
}

// ─── Form Fields ──────────────────────────────────────────────────────────────
// Defined OUTSIDE ProductsTab so React never remounts it on re-render,
// which would cause inputs to lose focus on every keystroke.

function FormFields({
  form,
  setForm,
  categoryTree,
}: {
  form: ProductForm;
  setForm: (form: ProductForm) => void;
  categoryTree: Category[];
}) {
  return (
    <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
      {/* SKU + Base Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            SKU{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            placeholder="PRD001"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Base Unit <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Pcs"
            value={form.baseUnit}
            onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
          />
        </div>
      </div>

      {/* Product Name */}
      <div className="space-y-2">
        <Label>
          Product Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="Enter product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <ProductCategorySelect
          value={form.categoryId}
          onChange={(v) => setForm({ ...form, categoryId: v })}
          categoryTree={categoryTree}
        />
      </div>

      {/* Price + Tax */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Selling Price</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={form.currentSellPrice}
            onChange={(e) =>
              setForm({ ...form, currentSellPrice: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tax Rate (%)</Label>
          <Input
            type="number"
            placeholder="18"
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
          />
        </div>
      </div>

      {/* Stock Item toggle */}
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <Label className="cursor-pointer">Stock Item</Label>
          <p className="text-xs text-muted-foreground">
            Track inventory for this product
          </p>
        </div>
        <Switch
          checked={form.isStockItem}
          onCheckedChange={(v) => setForm({ ...form, isStockItem: v })}
        />
      </div>

      <Separator />

      {/* Unit conversions */}
      <UnitConversionsEditor
        baseUnit={form.baseUnit}
        rows={form.unitRows}
        onChange={(rows) => setForm({ ...form, unitRows: rows })}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductsTab({
  products,
  categories,
  loading,
  onProductsChange,
  onRefresh,
}: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProductForm>(defaultForm);

  const categoryTree = buildCategoryTree(categories);

  // ── filtering ────────────────────────────────────────────────────────────────

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    let matchCategory = true;
    if (selectedCategoryId !== null) {
      const childIds = categories
        .filter((c) => c.parentId === selectedCategoryId)
        .map((c) => c.id);
      matchCategory =
        p.categoryId === selectedCategoryId ||
        (p.categoryId !== null && childIds.includes(p.categoryId));
    }
    return matchSearch && matchCategory;
  });

  // ── form ↔ API payload ────────────────────────────────────────────────────────

  const buildPayload = (f: ProductForm) => ({
    sku: f.sku || undefined,
    name: f.name,
    baseUnit: f.baseUnit,
    currentSellPrice: f.currentSellPrice
      ? parseFloat(f.currentSellPrice)
      : undefined,
    taxRate: f.taxRate ? parseFloat(f.taxRate) : undefined,
    isStockItem: f.isStockItem,
    categoryId: f.categoryId !== "0" ? f.categoryId : null,
    unitConversions: f.unitRows
      .filter((r) => r.unitName.trim() && r.conversionQty)
      .map((r) => ({
        unitName: r.unitName.trim(),
        conversionQty: parseInt(r.conversionQty),
      })),
  });

  const productToForm = (p: Product): ProductForm => ({
    sku: p.sku ?? "",
    name: p.name,
    baseUnit: p.baseUnit,
    currentSellPrice: p.currentSellPrice?.toString() ?? "",
    taxRate: p.taxRate?.toString() ?? "",
    isStockItem: p.isStockItem,
    categoryId: p.categoryId ?? "0",
    unitRows: p.unitConversions
      .filter((u) => u.unitName !== p.baseUnit)
      .map((u) => ({
        unitName: u.unitName,
        conversionQty: u.conversionQty.toString(),
      })),
  });

  // ── handlers ─────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post(`${BASE}/products`, buildPayload(form));
      onProductsChange([...products, res.data.data]);
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to create product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    try {
      setSubmitting(true);
      const res = await axios.put(
        `${BASE}/products/${editingProduct.id}`,
        buildPayload(form),
      );
      onProductsChange(
        products.map((p) => (p.id === editingProduct.id ? res.data.data : p)),
      );
      setIsEditOpen(false);
      setEditingProduct(null);
      setForm(defaultForm);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to update product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`${BASE}/products/${id}`);
      onProductsChange(products.filter((p) => p.id !== id));
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to delete product",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setIsEditOpen(true);
  };

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[260px] justify-between bg-transparent"
              >
                {selectedCategoryId === null
                  ? `All Products (${products.length})`
                  : `${getCategoryLabel(selectedCategoryId, categories)} (${filteredProducts.length})`}
                <Tags className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0">
              <Command>
                <CommandInput placeholder="Search categories…" />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSelectedCategoryId(null);
                        setComboboxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategoryId === null
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      All Products ({products.length})
                    </CommandItem>
                    {categoryTree.map((parent) => (
                      <>
                        <CommandItem
                          key={`p-${parent.id}`}
                          value={parent.name}
                          onSelect={() => {
                            setSelectedCategoryId(parent.id);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategoryId === parent.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <FolderOpen className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {parent.name}
                        </CommandItem>
                        {parent.children?.map((child) => (
                          <CommandItem
                            key={`c-${child.id}`}
                            value={`${parent.name} ${child.name}`}
                            onSelect={() => {
                              setSelectedCategoryId(child.id);
                              setComboboxOpen(false);
                            }}
                            className="pl-7"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategoryId === child.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <ChevronRight className="mr-1 h-3 w-3 text-muted-foreground" />
                            {child.name}
                          </CommandItem>
                        ))}
                      </>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {/* ✅ Pass form + setForm as props instead of closing over them */}
            <FormFields
              form={form}
              setForm={setForm}
              categoryTree={categoryTree}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  submitting || !form.name.trim() || !form.baseUnit.trim()
                }
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading products…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="text-right">Sell Price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const cat = categories.find(
                    (c) => c.id === product.categoryId,
                  );
                  const parent = cat
                    ? categories.find((c) => c.id === cat.parentId)
                    : null;
                  const extraUnits = product.unitConversions.filter(
                    (u) => u.unitName !== product.baseUnit,
                  );
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.sku ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {cat ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {parent && (
                              <>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal text-muted-foreground"
                                >
                                  {parent.name}
                                </Badge>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              </>
                            )}
                            <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
                              {cat.name}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium"
                          >
                            {product.baseUnit}
                          </Badge>
                          {extraUnits.map((u) => (
                            <Badge
                              key={u.id}
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              {u.unitName} ={u.conversionQty}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.currentSellPrice != null ? (
                          `₹${product.currentSellPrice.toLocaleString()}`
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.taxRate != null ? `${product.taxRate}%` : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            product.isStockItem ? "default" : "secondary"
                          }
                          className={cn(
                            "text-xs",
                            product.isStockItem &&
                              "bg-green-100 text-green-800 hover:bg-green-100",
                          )}
                        >
                          {product.isStockItem ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id)}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {searchTerm || selectedCategoryId
                        ? "No products match your filters"
                        : "No products yet — add your first product"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {/* ✅ Same fix — pass as props */}
          <FormFields
            form={form}
            setForm={setForm}
            categoryTree={categoryTree}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                submitting || !form.name.trim() || !form.baseUnit.trim()
              }
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
