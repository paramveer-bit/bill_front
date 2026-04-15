import { Package, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductItemProps {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function ProductItem({
  product,
  onEdit,
  onDelete,
  deletingId,
}: ProductItemProps) {
  // Aggregate stock from all batches
  const totalStock =
    product.totalStockPcs ??
    product.purchaseBatches?.reduce((sum, b) => sum + b.qtyRemaining, 0) ??
    0;

  // Highlight low stock (Critical threshold: 10)
  const isCritical = product.isStockItem && totalStock < 10;

  return (
    <div className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-2 ml-4 md:ml-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
      {/* Identity & Conversions */}
      <div className="flex items-start gap-3 flex-1 min-w-[250px]">
        <div
          className={cn(
            "p-2.5 rounded-lg transition-colors",
            isCritical
              ? "bg-red-50 text-red-500"
              : "bg-slate-100 text-slate-500 group-hover:bg-primary/10",
          )}
        >
          <Package className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">
              {product.name}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono h-4">
              {product.sku || "NO-SKU"}
            </Badge>
          </div>
          {/* Packaging Info */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {product.unitConversions
              ?.filter((uc) => uc.unitName !== product.baseUnit)
              .map((uc) => (
                <span
                  key={uc.id}
                  className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 font-bold uppercase tracking-tight"
                >
                  1 {uc.unitName} = {uc.conversionQty} {product.baseUnit}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Inventory & Price Tracking */}
      <div className="flex flex-col items-start md:items-center min-w-[100px] px-4 border-x border-slate-100">
        <span className="text-[9px] uppercase font-bold text-slate-400">
          Inventory
        </span>
        <div
          className={cn(
            "text-lg font-black",
            isCritical ? "text-red-600" : "text-slate-900",
          )}
        >
          {totalStock}{" "}
          <span className="text-[10px] font-normal text-slate-500 uppercase">
            {product.baseUnit}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end min-w-[100px]">
        <span className="text-[9px] uppercase font-bold text-slate-400">
          Rate/{product.baseUnit}
        </span>
        <div className="text-lg font-black text-slate-900">
          ₹{product.currentSellPrice}
        </div>
      </div>

      {/* Row Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-primary"
          onClick={() => onEdit(product)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/5"
          onClick={() => onDelete(product.id)}
          disabled={deletingId === product.id}
        >
          {deletingId === product.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
