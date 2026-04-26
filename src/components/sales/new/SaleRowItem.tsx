"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader2, Trash2, ChevronsUpDown, AlertTriangle } from "lucide-react";
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
} from "@/components/ui/command";
import { SalePriceInput } from "./SalePriceInput";
import { Product, SaleRow, UnitConversion } from "@/lib/types";
import { showErrorToast } from "@/lib/helpers/toast";

const BASE = process.env.NEXT_PUBLIC_BASEURL;

// -- Helpers --
const getConvQty = (unit: string, convs: UnitConversion[]) => {
  const found = convs.find((c) => c.unitName === unit);
  if (!found) return 1;
  return found.conversionQty;
};

const toBasePcs = (qty: string, unit: string, convs: UnitConversion[]) =>
  (parseFloat(qty) || 0) * getConvQty(unit, convs);

const sortedConversions = (convs: UnitConversion[]) =>
  [...convs].sort((a, b) => a.conversionQty - b.conversionQty);

const stockInSelectedUnit = (
  stock: number,
  unit: string,
  convs: UnitConversion[],
) => {
  const convQty = getConvQty(unit, convs);
  return Math.floor(stock / convQty);
};
import { useApi } from "@/hooks/useApi";
export function SaleRowItem({
  row,
  index,
  rows,
  canRemove,
  focusOnMount,
  onChange,
  onRemove,
}: {
  row: SaleRow;
  index: number;
  rows: SaleRow[];
  canRemove: boolean;
  focusOnMount: boolean;
  onChange: (index: number, updated: SaleRow) => void;
  onRemove: (index: number) => void;
}) {
  const { product } = row;
  const conversions = product ? sortedConversions(product.unitConversions) : [];
  const [productOpen, setProductOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const api = useApi();
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/products`, {
          params: { search: query },
        });
        setResults(res.data.data.data);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleProductChange = async (p: Product) => {
    // Check if the product is already selected in another row
    const isDuplicate = rows.some(
      (r, i) => r.productId === p.id && i !== index,
    );

    if (isDuplicate) {
      showErrorToast(`${p.name} is already in this invoice.`);
      setProductOpen(false);
      return;
    }
    const convs = sortedConversions(p.unitConversions);
    const defaultUnit = convs[0]?.unitName ?? p.baseUnit;
    const defaultConvQty = getConvQty(defaultUnit, convs);

    const update: SaleRow = {
      ...row,
      productId: p.id,
      product: p,
      selectedUnit: defaultUnit,
      qtyInput: "",
      qtyBase: 0,
      loadingStock: true,
      sellPrice: p.currentSellPrice
        ? (p.currentSellPrice * defaultConvQty).toFixed(2)
        : "",
    };

    onChange(index, update);
    setProductOpen(false);

    try {
      const res = await api.get(`/products/${p.id}/stock-info`);
      const stock = res.data.data?.totalStockPcs ?? 0;
      console.log(stock);
      onChange(index, { ...update, stockBase: stock, loadingStock: false });
    } catch {
      onChange(index, { ...update, loadingStock: false });
    }
  };

  const handleUnitChange = (newUnit: string) => {
    const currentUnitPrice = parseFloat(row.sellPrice) || 0;
    const currentConvQty = getConvQty(row.selectedUnit, conversions);
    const currentBasePrice = currentUnitPrice / currentConvQty;

    const newConvQty = getConvQty(newUnit, conversions);
    const newUnitPrice = currentBasePrice * newConvQty;

    onChange(index, {
      ...row,
      selectedUnit: newUnit,
      qtyBase: toBasePcs(row.qtyInput, newUnit, conversions),
      sellPrice: newUnitPrice.toFixed(2),
    });
  };

  const availableInUnit =
    row.stockBase !== null
      ? stockInSelectedUnit(row.stockBase, row.selectedUnit, conversions)
      : null;
  const isOverStock =
    availableInUnit !== null &&
    (parseFloat(row.qtyInput) || 0) > availableInUnit;

  const lineTotal =
    (parseFloat(row.qtyInput) || 0) * (parseFloat(row.sellPrice) || 0);

  return (
    <>
      <TableRow className="h-10 align-middle border-b-0">
        {/* Product - Matches BatchRow 200px */}
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
                {" "}
                //
                <CommandInput
                  placeholder="Search..."
                  value={query}
                  onValueChange={setQuery}
                  className="h-8"
                />
                <CommandList>
                  {searching && (
                    <div className="p-2 text-center text-xs">
                      <Loader2 className="animate-spin inline mr-2 h-3 w-3" />
                      Searching...
                    </div>
                  )}
                  {results.map((p) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => handleProductChange(p)}
                    >
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

        {/* Qty & Unit - Matches BatchRow 200px */}
        <TableCell className="w-[200px] py-1 align-middle">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={row.qtyInput}
              onChange={(e) =>
                onChange(index, {
                  ...row,
                  qtyInput: e.target.value,
                  qtyBase: toBasePcs(
                    e.target.value,
                    row.selectedUnit,
                    conversions,
                  ),
                })
              }
              className={cn(
                "h-8 w-20 text-sm",
                isOverStock && "border-destructive",
              )}
              disabled={!product}
            />
            {conversions.length > 1 ? (
              <Select value={row.selectedUnit} onValueChange={handleUnitChange}>
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

        {/* Price - Matches BatchRow 130px */}
        <TableCell className="w-[130px] py-1 align-middle">
          <SalePriceInput
            value={row.sellPrice}
            onChange={(v) => onChange(index, { ...row, sellPrice: v })}
            disabled={!product}
          />
        </TableCell>

        {/* Spacing columns to match BatchRow grid (MRP/SellingPrice equivalents) */}
        <TableCell className="w-[130px] py-1" />
        <TableCell className="w-[130px] py-1" />

        {/* Total - Matches BatchRow 110px */}
        <TableCell className="w-[110px] py-1 align-middle text-right font-semibold text-sm">
          {lineTotal > 0
            ? `₹${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : "—"}
        </TableCell>

        {/* Actions - Matches BatchRow 10 */}
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

      {/* Detail Sub-Row - Matches BatchRow styling and border */}
      <TableRow className="h-5 bg-muted/20 border-b border-border/60">
        <TableCell className="py-0 text-xs text-muted-foreground font-mono">
          {product?.sku ?? "No SKU"}
        </TableCell>
        <TableCell className="py-0 text-xs text-muted-foreground">
          {isOverStock ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Only {availableInUnit} in stock
            </span>
          ) : (
            availableInUnit !== null && (
              <span>
                = {row.qtyBase} {product?.baseUnit} ({availableInUnit} avail)
              </span>
            )
          )}
        </TableCell>
        <TableCell className="py-0">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>per {row.selectedUnit || "unit"}</span>
          </div>
        </TableCell>
        <TableCell className="py-0" />
        <TableCell className="py-0" />
        <TableCell className="py-0 text-right text-xs text-muted-foreground">
          {row.qtyBase > 0 && row.selectedUnit !== product?.baseUnit
            ? "multi-unit"
            : "base"}
        </TableCell>
        <TableCell className="py-0" />
      </TableRow>
    </>
  );
}
