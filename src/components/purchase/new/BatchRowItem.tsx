"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Trash2,
  ChevronsUpDown,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { PriceInput } from "./PriceInput";
import { Product, UnitConversion } from "@/lib/types"; // Assuming these types exist in your lib
import { showErrorToast } from "@/lib/helpers/toast";
import { useApi } from "@/hooks/useApi";

// -- Helpers --
const getConvQty = (unit: string, convs: UnitConversion[]) => {
  const found = convs.find((c) => c.unitName === unit);
  return found ? found.conversionQty : 1;
};

const toBasePcs = (qty: string, unit: string, convs: UnitConversion[]) =>
  (parseFloat(qty) || 0) * getConvQty(unit, convs);

const sortedConversions = (convs: UnitConversion[]) =>
  [...convs].sort((a, b) => b.conversionQty - a.conversionQty);

const rescalePrice = (
  priceStr: string,
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[],
): string => {
  if (!priceStr) return "";
  const price = parseFloat(priceStr);
  if (isNaN(price)) return "";
  const basePrice = price / getConvQty(fromUnit, conversions);
  return (basePrice * getConvQty(toUnit, conversions)).toFixed(2);
};

const toBasePrice = (
  priceStr: string,
  selectedUnit: string,
  conversions: UnitConversion[],
): number | undefined => {
  if (!priceStr) return undefined;
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) return undefined;
  return price / getConvQty(selectedUnit, conversions);
};

export function BatchRowItem({
  batch,
  index,
  batches,
  canRemove,
  focusOnMount,
  onChange,
  onRemove,
}: any) {
  const [productOpen, setProductOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const api = useApi();
  // Reference to the currently selected product object (stored in batch or derived)
  const product = batch.product;
  const conversions = product ? sortedConversions(product.unitConversions) : [];
  const isBaseUnit =
    !batch.selectedUnit || batch.selectedUnit === product?.baseUnit;
  const lineTotal =
    (parseFloat(batch.qtyInput) || 0) * (parseFloat(batch.unitCost) || 0);

  // 1. Debounced Search Effect (Implementation like SaleRowItem)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`products`, {
          params: { search: query },
        });
        setResults(res.data.data.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // 2. Focus on Mount logic
  useEffect(() => {
    if (focusOnMount) {
      const t = setTimeout(() => triggerRef.current?.click(), 50);
      return () => clearTimeout(t);
    }
  }, [focusOnMount]);

  const handleProductChange = (p: Product) => {
    const isDuplicate = batches.some(
      (b: any, i: number) => b.productId === p.id && i !== index,
    );

    if (isDuplicate) {
      showErrorToast(`${p.name} is already in this purchase list.`);
      setProductOpen(false);
      return;
    }

    const convs = sortedConversions(p.unitConversions);
    const defaultUnit = convs[0]?.unitName ?? p.baseUnit;
    const defaultConvQty = getConvQty(defaultUnit, convs);

    onChange(index, {
      ...batch,
      productId: p.id,
      product: p, // Store the product object in the row state
      selectedUnit: defaultUnit,
      qtyInput: "",
      qtyReceivedBase: 0,
      unitCost: "",
      sellingPrice: p.currentSellPrice
        ? (p.currentSellPrice * defaultConvQty).toFixed(2)
        : "",
      mrp: "",
    });
    setProductOpen(false);
  };

  const handleUnitChange = (newUnit: string) => {
    onChange(index, {
      ...batch,
      selectedUnit: newUnit,
      qtyReceivedBase: toBasePcs(batch.qtyInput, newUnit, conversions),
      unitCost: rescalePrice(
        batch.unitCost,
        batch.selectedUnit,
        newUnit,
        conversions,
      ),
      sellingPrice: rescalePrice(
        batch.sellingPrice,
        batch.selectedUnit,
        newUnit,
        conversions,
      ),
      mrp: rescalePrice(batch.mrp, batch.selectedUnit, newUnit, conversions),
    });
  };

  const baseHint = (priceStr: string) => {
    if (!priceStr || isBaseUnit) return null;
    const base = toBasePrice(priceStr, batch.selectedUnit, conversions);
    return base ? `₹${base.toFixed(2)}/${product?.baseUnit}` : null;
  };

  const selectedUnitLabel = batch.selectedUnit || product?.baseUnit || "unit";

  return (
    <>
      <TableRow className="h-10 align-middle border-b-0">
        {/* Product Search Popover */}
        <TableCell className="w-[200px] py-1 align-middle">
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                className="h-8 w-full justify-between text-sm font-normal px-2"
              >
                <span className="truncate text-left">
                  {product ? product.name : "Select product…"}
                </span>
                <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search products..."
                  value={query}
                  onValueChange={setQuery}
                  className="h-8"
                />
                <CommandList>
                  {searching && (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      <Loader2 className="animate-spin inline mr-2 h-3 w-3" />
                      Searching...
                    </div>
                  )}
                  {!searching && results.length === 0 && query && (
                    <CommandEmpty>No products found.</CommandEmpty>
                  )}
                  {results.map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => handleProductChange(p)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          batch.productId === p.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.sku}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </TableCell>

        {/* Qty & Unit */}
        <TableCell className="w-[200px] py-1 align-middle">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={batch.qtyInput}
              onChange={(e) =>
                onChange(index, {
                  ...batch,
                  qtyInput: e.target.value,
                  qtyReceivedBase: toBasePcs(
                    e.target.value,
                    batch.selectedUnit,
                    conversions,
                  ),
                })
              }
              className="h-8 w-20 text-sm"
              disabled={!product}
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
                      {c.unitName}{" "}
                      {c.unitName !== product?.baseUnit &&
                        `×${c.conversionQty}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="h-8">
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
            // disabled={!product}
          />
        </TableCell>

        {/* Selling Price */}
        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.sellingPrice}
            onChange={(v) => onChange(index, { ...batch, sellingPrice: v })}
            // disabled={!product}
          />
        </TableCell>

        {/* MRP */}
        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.mrp}
            onChange={(v) => onChange(index, { ...batch, mrp: v })}
            // disabled={!product}
          />
        </TableCell>

        {/* Line Total */}
        <TableCell className="w-[110px] py-1 align-middle text-right font-semibold text-sm">
          {lineTotal > 0
            ? `₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : "—"}
        </TableCell>

        {/* Actions */}
        <TableCell className="w-10 py-1 align-middle">
          {canRemove && (
            <Button
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

      {/* Detail Sub-Row */}
      <TableRow className="h-5 bg-muted/20 border-b border-border/60">
        <TableCell className="py-0 text-xs text-muted-foreground font-mono">
          {product?.sku ?? "No SKU"}
        </TableCell>
        <TableCell className="py-0 text-xs text-muted-foreground">
          {batch.qtyReceivedBase > 0 &&
            `= ${batch.qtyReceivedBase} ${product?.baseUnit}`}
        </TableCell>
        <TableCell className="py-0">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>per {selectedUnitLabel}</span>
            <span className="text-blue-500/70">{baseHint(batch.unitCost)}</span>
          </div>
        </TableCell>
        <TableCell className="py-0">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>per {selectedUnitLabel}</span>
            <span className="text-blue-500/70">
              {baseHint(batch.sellingPrice)}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-0">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>per {selectedUnitLabel}</span>
            <span className="text-blue-500/70">{baseHint(batch.mrp)}</span>
          </div>
        </TableCell>
        <TableCell className="py-0 text-right text-xs text-muted-foreground">
          {batch.qtyReceivedBase > 0 && !isBaseUnit ? "multi-unit" : "base"}
        </TableCell>
        <TableCell className="py-0" />
      </TableRow>
    </>
  );
}
