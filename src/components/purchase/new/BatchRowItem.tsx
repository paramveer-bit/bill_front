"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { PriceInput } from "./PriceInput";

// -- Helper Logic (Moved from main page for encapsulation) --
function getConvQty(unitName: string, conversions: any[]): number {
  return conversions.find((c) => c.unitName === unitName)?.conversionQty ?? 1;
}

function toBasePcs(
  qtyInput: string,
  selectedUnit: string,
  conversions: any[],
): number {
  const qty = parseFloat(qtyInput) || 0;
  return qty * getConvQty(selectedUnit, conversions);
}

function rescalePrice(
  priceStr: string,
  fromUnit: string,
  toUnit: string,
  conversions: any[],
): string {
  if (!priceStr) return "";
  const price = parseFloat(priceStr);
  if (isNaN(price)) return "";
  const basePrice = price / getConvQty(fromUnit, conversions);
  return (basePrice * getConvQty(toUnit, conversions)).toFixed(2);
}

function toBasePrice(
  priceStr: string,
  selectedUnit: string,
  conversions: any[],
): number | undefined {
  if (!priceStr) return undefined;
  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) return undefined;
  return price / getConvQty(selectedUnit, conversions);
}

function sortedConversions(conversions: any[]) {
  return [...conversions].sort((a, b) => b.conversionQty - a.conversionQty);
}

export function BatchRowItem({
  batch,
  index,
  products,
  canRemove,
  focusOnMount,
  onChange,
  onRemove,
}: any) {
  const product = products.find((p: any) => p.id === batch.productId);
  const conversions = product ? sortedConversions(product.unitConversions) : [];
  const isBaseUnit =
    !batch.selectedUnit || batch.selectedUnit === product?.baseUnit;
  const lineTotal =
    (parseFloat(batch.qtyInput) || 0) * (parseFloat(batch.unitCost) || 0);

  const [productOpen, setProductOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusOnMount) {
      const t = setTimeout(() => triggerRef.current?.click(), 50);
      return () => clearTimeout(t);
    }
  }, [focusOnMount]);

  const handleProductChange = (productId: string) => {
    const p = products.find((pr: any) => pr.id === productId);
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
    return base ? `₹${base.toFixed(2)}/${product?.baseUnit}` : null;
  };

  const selectedUnitLabel = batch.selectedUnit || product?.baseUnit || "unit";

  return (
    <>
      <TableRow className="h-10 align-middle border-b-0">
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
              <Command>
                <CommandInput placeholder="Search..." className="h-8" />
                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((p: any) => (
                      <CommandItem
                        key={p.id}
                        onSelect={() => handleProductChange(p.id)}
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
                          {p.sku && (
                            <span className="text-xs text-muted-foreground">
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

        <TableCell className="w-[200px] py-1 align-middle">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={batch.qtyInput}
              onChange={(e) => handleQtyChange(e.target.value)}
              className="h-8 w-20 text-sm"
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
                  {conversions.map((c: any) => (
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

        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.unitCost}
            onChange={(v) => onChange(index, { ...batch, unitCost: v })}
          />
        </TableCell>

        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.sellingPrice}
            onChange={(v) => onChange(index, { ...batch, sellingPrice: v })}
          />
        </TableCell>

        <TableCell className="w-[130px] py-1 align-middle">
          <PriceInput
            value={batch.mrp}
            onChange={(v) => onChange(index, { ...batch, mrp: v })}
          />
        </TableCell>

        <TableCell className="w-[110px] py-1 align-middle text-right font-semibold text-sm">
          {lineTotal > 0
            ? `₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : "—"}
        </TableCell>

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

      {/* Sub-row for detail hints */}
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
