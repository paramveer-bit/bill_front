import { Package, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

interface ProductItemProps {
  categoryId: string;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export default function ProductItem({
  categoryId,
  onEdit,
  onDelete,
  deletingId,
}: ProductItemProps) {
  const [isloading, setIsLoading] = useState(false);
  const [products, setCategoryProducts] = useState<Product[]>([]);
  // Tracks which unit the user has chosen to view stock in, per product id
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>(
    {},
  );
  const api = useApi();

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      const res = await api.get(`/products/category/${categoryId}`);
      setCategoryProducts(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch products for category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProductsByCategory(categoryId);
  }, [categoryId, api]);

  // Aggregate stock from all batches (always in base units)
  const totalStock = (product: Product) => {
    return (
      product.currentStock ??
      product.purchaseBatches?.reduce((sum, b) => sum + b.qtyRemaining, 0) ??
      0
    );
  };

  // Highlight low stock (Critical threshold: 10, evaluated in base units)
  const isCritical = (product: Product) => {
    return product.isStockItem && totalStock(product) < 10;
  };

  // Every selectable unit for a product: its base unit plus any conversion units
  const getUnitOptions = (product: Product) => {
    const options = [{ unitName: product.baseUnit, conversionQty: 1 }];
    product.unitConversions?.forEach((uc) => {
      if (uc.unitName !== product.baseUnit) {
        options.push({
          unitName: uc.unitName,
          conversionQty: uc.conversionQty,
        });
      }
    });
    return options;
  };

  const getSelectedUnit = (product: Product) => {
    return selectedUnits[product.id] || product.baseUnit;
  };

  // Convert the base-unit stock total into whichever unit is currently selected
  const displayStock = (product: Product) => {
    const stockInBase = totalStock(product);
    const unit = getSelectedUnit(product);
    if (unit === product.baseUnit) return stockInBase;

    const conv = product.unitConversions?.find((uc) => uc.unitName === unit);
    if (!conv || !conv.conversionQty) return stockInBase;

    const converted = stockInBase / conv.conversionQty;
    // Show whole numbers cleanly, otherwise round to 2 decimal places
    return Number.isInteger(converted)
      ? converted
      : Number(converted.toFixed(2));
  };

  const handleUnitChange = (productId: string, unit: string) => {
    setSelectedUnits((prev) => ({ ...prev, [productId]: unit }));
  };

  if (isloading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 ml-4 md:ml-8 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-slate-500 font-medium">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-2 ml-4 md:ml-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
        >
          {/* Identity & Conversions */}
          <div className="flex items-start gap-3 flex-1 min-w-[250px]">
            <div
              className={cn(
                "p-2.5 rounded-lg transition-colors",
                isCritical(product)
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

          {/* Unit Selector + Inventory & Price Tracking */}
          <div className="flex items-center gap-3 w-[200px] shrink-0 px-4 border-x border-slate-100">
            <select
              value={getSelectedUnit(product)}
              onChange={(e) => handleUnitChange(product.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-[76px] shrink-0 text-[10px] font-bold uppercase bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
            >
              {getUnitOptions(product).map((opt) => (
                <option key={opt.unitName} value={opt.unitName}>
                  {opt.unitName}
                </option>
              ))}
            </select>

            <div className="flex flex-col items-start w-[80px] shrink-0">
              <span className="text-[9px] uppercase font-bold text-slate-400">
                Inventory
              </span>
              <div
                className={cn(
                  "text-lg font-black whitespace-nowrap",
                  isCritical(product) ? "text-red-600" : "text-slate-900",
                )}
              >
                {displayStock(product)}{" "}
                <span className="text-[10px] font-normal text-slate-500 uppercase">
                  {getSelectedUnit(product)}
                </span>
              </div>
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
      ))}
    </>
  );
}
