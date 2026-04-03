"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowLeft, Trash2, Loader2, PackageOpen } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers";
import { showSuccessToast } from "@/lib/helpers";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

// ─── Types ────────────────────────────────────────────────────────────────────

type UnitConversion = {
  id: string;
  unitName: string;
  conversionQty: number; // how many base units = 1 of this unit
};

type Product = {
  id: string;
  sku: string | null;
  name: string;
  baseUnit: string;
  currentSellPrice: number | null;
  taxRate: number | null;
  unitConversions: UnitConversion[];
};

type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
};

// One row in the purchase items table.
// All price fields are stored in the SELECTED unit.
// They are divided by conversionQty only when building the API payload.
type BatchRow = {
  productId: string;
  qtyInput: string;
  selectedUnit: string;
  qtyReceivedBase: number; // computed — always in base units
  unitCost: string; // price per SELECTED unit (shown to user)
  sellingPrice: string; // price per SELECTED unit (shown to user)
  mrp: string; // price per SELECTED unit (shown to user)
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyBatch(): BatchRow {
  return {
    productId: "",
    qtyInput: "",
    selectedUnit: "",
    qtyReceivedBase: 0,
    unitCost: "",
    sellingPrice: "",
    mrp: "",
  };
}

/** How many base units = 1 of unitName */
function getConvQty(unitName: string, conversions: UnitConversion[]): number {
  return conversions.find((c) => c.unitName === unitName)?.conversionQty ?? 1;
}

/** Convert user qty in selectedUnit → base units */
function toBasePcs(
  qtyInput: string,
  selectedUnit: string,
  conversions: UnitConversion[],
): number {
  const qty = parseFloat(qtyInput) || 0;
  return qty * getConvQty(selectedUnit, conversions);
}

/**
 * Re-express a price from one unit into another via the base unit.
 * e.g. ₹9000/Case → ₹360/Ladi (when Case=300, Ladi=12)
 */
function rescalePrice(
  priceStr: string,
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[],
): string {
  if (!priceStr) return "";
  const price = parseFloat(priceStr);
  if (isNaN(price)) return "";
  const basePrice = price / getConvQty(fromUnit, conversions);
  return (basePrice * getConvQty(toUnit, conversions)).toFixed(2);
}

/**
 * Convert a price in selectedUnit → base unit price (for API payload).
 * e.g. ₹9000/Case ÷ 300 = ₹30/Pcs
 */
function toBasePrice(
  priceStr: string,
  selectedUnit: string,
  conversions: UnitConversion[],
): number | undefined {
  if (!priceStr) return undefined;
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) return undefined;
  return price / getConvQty(selectedUnit, conversions);
}

/** Sort conversions largest → smallest (Case > Ladi > Pcs) */
function sortedConversions(conversions: UnitConversion[]): UnitConversion[] {
  return [...conversions].sort((a, b) => b.conversionQty - a.conversionQty);
}

// ─── BatchRowItem ─────────────────────────────────────────────────────────────
// Defined OUTSIDE the page so React never remounts it on state change,
// which would cause inputs to lose focus on every keystroke.

function PriceInput({
  value,
  onChange,
  placeholder = "0.00",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        ₹
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-5 h-8 text-sm w-full"
      />
    </div>
  );
}

function BatchRowItem({
  batch,
  index,
  products,
  canRemove,
  focusOnMount,
  onChange,
  onRemove,
}: {
  batch: BatchRow;
  index: number;
  products: Product[];
  canRemove: boolean;
  focusOnMount: boolean;
  onChange: (index: number, updated: BatchRow) => void;
  onRemove: (index: number) => void;
}) {
  const product = products.find((p) => p.id === batch.productId);
  const conversions = product ? sortedConversions(product.unitConversions) : [];
  const isBaseUnit =
    !batch.selectedUnit || batch.selectedUnit === product?.baseUnit;
  const lineTotal =
    (parseFloat(batch.qtyInput) || 0) * (parseFloat(batch.unitCost) || 0);

  // Searchable product combobox
  const [productOpen, setProductOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-open when row is newly added
  useEffect(() => {
    if (focusOnMount) {
      const t = setTimeout(() => triggerRef.current?.click(), 50);
      return () => clearTimeout(t);
    }
  }, [focusOnMount]);

  const handleProductChange = (productId: string) => {
    const p = products.find((pr) => pr.id === productId);
    const convs = p ? sortedConversions(p.unitConversions) : [];
    const defaultUnit = convs[0]?.unitName ?? p?.baseUnit ?? "";
    const defaultConvQty = getConvQty(defaultUnit, convs);
    setProductOpen(false);
    onChange(index, {
      ...batch,
      productId,
      selectedUnit: defaultUnit,
      qtyInput: "",
      qtyReceivedBase: 0,
      unitCost: "",
      sellingPrice: p?.currentSellPrice
        ? (p.currentSellPrice * defaultConvQty).toFixed(2)
        : "",
      mrp: "",
    });
  };

  const handleQtyChange = (qtyInput: string) => {
    onChange(index, {
      ...batch,
      qtyInput,
      qtyReceivedBase: toBasePcs(qtyInput, batch.selectedUnit, conversions),
    });
  };

  const handleUnitChange = (selectedUnit: string) => {
    onChange(index, {
      ...batch,
      selectedUnit,
      qtyReceivedBase: toBasePcs(batch.qtyInput, selectedUnit, conversions),
      unitCost: rescalePrice(
        batch.unitCost,
        batch.selectedUnit,
        selectedUnit,
        conversions,
      ),
      sellingPrice: rescalePrice(
        batch.sellingPrice,
        batch.selectedUnit,
        selectedUnit,
        conversions,
      ),
      mrp: rescalePrice(
        batch.mrp,
        batch.selectedUnit,
        selectedUnit,
        conversions,
      ),
    });
  };

  const baseHint = (priceStr: string) => {
    if (!priceStr || isBaseUnit) return null;
    const base = toBasePrice(priceStr, batch.selectedUnit, conversions);
    if (!base) return null;
    return `₹${base.toFixed(2)}/${product?.baseUnit}`;
  };

  const selectedUnitLabel = batch.selectedUnit || product?.baseUnit || "unit";

  return (
    <>
      {/* ── Main input row ── */}
      <TableRow className="h-10 align-middle border-b-0">
        {/* Product — searchable combobox */}
        <TableCell className="w-[200px] py-1 align-middle">
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={productOpen}
                className="h-8 w-full justify-between text-sm font-normal px-2"
              >
                <span className="truncate text-left">
                  {product ? product.name : "Select product…"}
                </span>
                <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search by name or SKU…"
                  className="h-8"
                />
                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={`${p.name} ${p.sku ?? ""}`}
                        onSelect={() => handleProductChange(p.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3.5 w-3.5 shrink-0",
                            batch.productId === p.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{p.name}</span>
                          {p.sku && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {p.sku}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </TableCell>

        {/* Qty + Unit */}
        <TableCell className="w-[200px] py-1 align-middle">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={batch.qtyInput}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="h-8 w-20 text-sm shrink-0"
            />
            {conversions.length > 1 ? (
              <Select
                value={batch.selectedUnit}
                onValueChange={handleUnitChange}
              >
                <SelectTrigger className="h-8 w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conversions.map((c) => (
                    <SelectItem key={c.unitName} value={c.unitName}>
                      {c.unitName}
                      {c.unitName !== product?.baseUnit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ×{c.conversionQty}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant="outline"
                className="text-xs h-8 px-2 flex items-center shrink-0"
              >
                {product?.baseUnit ?? "—"}
              </Badge>
            )}
          </div>
        </TableCell>

        {/* Unit Cost */}
        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.unitCost}
            onChange={(v) => onChange(index, { ...batch, unitCost: v })}
          />
        </TableCell>

        {/* Selling Price */}
        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.sellingPrice}
            onChange={(v) => onChange(index, { ...batch, sellingPrice: v })}
          />
        </TableCell>

        {/* MRP */}
        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.mrp}
            onChange={(v) => onChange(index, { ...batch, mrp: v })}
          />
        </TableCell>

        {/* Line Total */}
        <TableCell className="w-[110px] py-1 align-middle text-right font-semibold tabular-nums text-sm">
          {lineTotal > 0 ? (
            `₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ) : (
            <span className="text-muted-foreground font-normal">—</span>
          )}
        </TableCell>

        {/* Remove */}
        <TableCell className="w-10 py-1 align-middle">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </TableCell>
      </TableRow>

      {/* ── Detail subrow — always same height, same columns ── */}
      <TableRow className="h-5 bg-muted/20 hover:bg-muted/20 border-b border-border/60">
        {/* Product detail: SKU */}
        <TableCell className="w-[200px] py-0 align-middle">
          {product ? (
            <span className="text-xs text-muted-foreground font-mono pl-1">
              {product.sku ?? "No SKU"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground pl-1 italic">—</span>
          )}
        </TableCell>

        {/* Qty detail: base unit equivalent */}
        <TableCell className="w-[200px] py-0 align-middle">
          {batch.qtyReceivedBase > 0 && !isBaseUnit ? (
            <span className="text-xs text-muted-foreground pl-1">
              = {batch.qtyReceivedBase} {product?.baseUnit}
            </span>
          ) : batch.qtyReceivedBase > 0 ? (
            <span className="text-xs text-muted-foreground pl-1">
              {batch.qtyReceivedBase} {product?.baseUnit}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground pl-1 italic">
              qty
            </span>
          )}
        </TableCell>

        {/* Unit cost detail: per-unit label + base equiv */}
        <TableCell className="w-[130px] py-0 align-middle">
          <div className="flex flex-col pl-1">
            <span className="text-xs text-muted-foreground">
              per {selectedUnitLabel}
            </span>
            {baseHint(batch.unitCost) && (
              <span className="text-xs text-blue-500/70">
                {baseHint(batch.unitCost)}
              </span>
            )}
          </div>
        </TableCell>

        {/* Sell price detail */}
        <TableCell className="w-[130px] py-0 align-middle">
          <div className="flex flex-col pl-1">
            <span className="text-xs text-muted-foreground">
              per {selectedUnitLabel}
            </span>
            {baseHint(batch.sellingPrice) && (
              <span className="text-xs text-blue-500/70">
                {baseHint(batch.sellingPrice)}
              </span>
            )}
            {product?.currentSellPrice && !batch.sellingPrice && (
              <span className="text-xs text-amber-500/80">
                default ₹
                {(
                  product.currentSellPrice *
                  getConvQty(selectedUnitLabel, conversions)
                ).toFixed(2)}
              </span>
            )}
          </div>
        </TableCell>

        {/* MRP detail */}
        <TableCell className="w-[130px] py-0 align-middle">
          <div className="flex flex-col pl-1">
            <span className="text-xs text-muted-foreground">
              per {selectedUnitLabel}
            </span>
            {baseHint(batch.mrp) && (
              <span className="text-xs text-blue-500/70">
                {baseHint(batch.mrp)}
              </span>
            )}
          </div>
        </TableCell>

        {/* Line total detail: base unit breakdown */}
        <TableCell className="w-[110px] py-0 align-middle text-right">
          {batch.qtyReceivedBase > 0 && batch.unitCost && !isBaseUnit ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {batch.qtyReceivedBase} × ₹
              {toBasePrice(
                batch.unitCost,
                batch.selectedUnit,
                conversions,
              )?.toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">base</span>
          )}
        </TableCell>

        <TableCell className="w-10 py-0" />
      </TableRow>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewPurchasePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceNo: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const [batches, setBatches] = useState<BatchRow[]>([emptyBatch()]);
  const [newestIndex, setNewestIndex] = useState<number | null>(null);

  // ── fetch ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        const [suppliersRes, productsRes] = await Promise.all([
          axios.get(`${BASE}/supplier/`),
          axios.get(`${BASE}/products`),
        ]);
        setSuppliers(suppliersRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        const error = err as AxiosError<any>;
        showErrorToast(error.response?.data?.message || "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // ── batch handlers ───────────────────────────────────────────────────────────

  const handleBatchChange = (index: number, updated: BatchRow) =>
    setBatches((prev) => prev.map((b, i) => (i === index ? updated : b)));

  const handleAddBatch = () => {
    setBatches((prev) => {
      const next = [...prev, emptyBatch()];
      setNewestIndex(next.length - 1);
      return next;
    });
  };

  const handleRemoveBatch = (index: number) =>
    setBatches((prev) => prev.filter((_, i) => i !== index));

  // ── totals (in selected-unit terms for display) ───────────────────────────────

  const totalAmount = batches.reduce((sum, b) => {
    const qty = parseFloat(b.qtyInput) || 0;
    const cost = parseFloat(b.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const totalItems = batches.filter(
    (b) => b.productId && b.qtyReceivedBase > 0,
  ).length;

  // ── validation ───────────────────────────────────────────────────────────────

  const isValid =
    !!formData.supplierId &&
    !!formData.purchaseDate &&
    batches.length > 0 &&
    batches.every(
      (b) =>
        b.productId &&
        b.qtyReceivedBase > 0 &&
        parseFloat(b.unitCost) > 0 &&
        parseFloat(b.sellingPrice) > 0 &&
        parseFloat(b.mrp) > 0,
    );

  // ── submit — convert all prices to base unit before sending ──────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setSubmitting(true);

      // Compute base-unit total for accounting accuracy
      const baseTotalAmount = batches.reduce((sum, b) => {
        const product = products.find((p) => p.id === b.productId);
        const convs = product?.unitConversions ?? [];
        const baseCost = toBasePrice(b.unitCost, b.selectedUnit, convs) ?? 0;
        return sum + b.qtyReceivedBase * baseCost;
      }, 0);

      const payload = {
        supplierId: formData.supplierId,
        invoiceNo: formData.invoiceNo.trim() || undefined,
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        totalAmount: baseTotalAmount,
        batches: batches.map((b) => {
          const product = products.find((p) => p.id === b.productId)!;
          const convs = product.unitConversions;
          return {
            productId: b.productId,
            qtyReceived: b.qtyReceivedBase, // base units
            qtyRemaining: b.qtyReceivedBase,
            unitCost: toBasePrice(b.unitCost, b.selectedUnit, convs)!, // base unit price
            sellingPrice: toBasePrice(b.sellingPrice, b.selectedUnit, convs), // base unit price
            mrp: toBasePrice(b.mrp, b.selectedUnit, convs), // base unit price
          };
        }),
      };

      await axios.post(`${BASE}/purchases`, payload);
      router.push("/purchase");
      showSuccessToast("Purchase saved successfully");
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to save purchase",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/purchase")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                New Purchase
              </h1>
              <p className="text-muted-foreground">Record a supplier invoice</p>
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading suppliers and products…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Purchase Info ── */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Purchase Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Supplier <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(v) =>
                          setFormData({ ...formData, supplierId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <div className="flex flex-col">
                                <span>{s.name}</span>
                                {s.contactName && (
                                  <span className="text-xs text-muted-foreground">
                                    {s.contactName}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Invoice Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="INV-2024-001"
                        value={formData.invoiceNo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            invoiceNo: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Purchase Date{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Purchase Items ── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Purchase Items
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Enter prices in the unit you select — converted to base
                        unit before saving
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBatch}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                      <PackageOpen className="h-8 w-8" />
                      <p>No products found. Add products first.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="w-[200px]">Product</TableHead>
                            <TableHead className="w-[200px]">
                              Qty & Unit
                            </TableHead>
                            <TableHead className="w-[130px]">
                              Unit Cost
                            </TableHead>
                            <TableHead className="w-[130px]">
                              Sell Price
                            </TableHead>
                            <TableHead className="w-[130px]">MRP</TableHead>
                            <TableHead className="w-[110px] text-right">
                              Total
                            </TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batches.map((batch, index) => (
                            <BatchRowItem
                              key={index}
                              batch={batch}
                              index={index}
                              products={products}
                              canRemove={batches.length > 1}
                              focusOnMount={index === newestIndex}
                              onChange={(i, updated) => {
                                handleBatchChange(i, updated);
                                // Clear newestIndex after first interaction
                                if (i === newestIndex) setNewestIndex(null);
                              }}
                              onRemove={handleRemoveBatch}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <Separator />
                  <div className="flex items-center justify-between px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      {totalItems > 0
                        ? `${totalItems} item${totalItems > 1 ? "s" : ""} ready`
                        : ""}
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold tabular-nums">
                        ₹
                        {totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Actions ── */}
              <div className="flex items-center justify-between">
                {!isValid && batches.some((b) => b.productId) && (
                  <p className="text-sm text-muted-foreground">
                    Fill in all required fields to save
                  </p>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/purchase")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isValid || submitting}>
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Save Purchase
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
