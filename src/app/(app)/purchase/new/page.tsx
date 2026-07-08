"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowLeft, Loader2, PackageOpen } from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
import { useKeyPress } from "@/hooks/handel_key_press";
// Refactored Components
import { PurchaseInfoCard } from "@/components/purchase/new/PurchaseInfoCard";
import { BatchRowItem } from "@/components/purchase/new/BatchRowItem";
import { useApi } from "@/hooks/useApi";

// Helper to get base price for submission
function toBasePrice(
  priceStr: string,
  selectedUnit: string,
  conversions: any[],
): number | undefined {
  if (!priceStr) return undefined;
  const price = parseFloat(priceStr);
  const conv =
    conversions.find((c) => c.unitName === selectedUnit)?.conversionQty ?? 1;
  return price / conv;
}

const emptyBatch = () => ({
  productId: "",
  product: null as any, // or use your Product type if defined
  qtyInput: "",
  selectedUnit: "",
  qtyReceivedBase: 0,
  unitCost: "",
  sellingPrice: "",
  mrp: "",
});

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceNo: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [batches, setBatches] = useState([emptyBatch()]);
  const [newestIndex, setNewestIndex] = useState<number | null>(null);
  const [coinAdjustment, setCoinAdjustment] = useState("");
  const api = useApi();
  useKeyPress("i", "ctrl", () => {
    if (document.activeElement?.tagName.toLowerCase() === "input") return;
    handleAddBatch();
  });
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        const suppliersRes = await api.get(`suppliers/all/`);

        setSuppliers(suppliersRes.data.data.data);
      } catch (err) {
        showErrorToast("Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const handleBatchChange = (index: number, updated: any) =>
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

  const totalAmount =
    batches.reduce(
      (sum, b) =>
        sum + (parseFloat(b.qtyInput) || 0) * (parseFloat(b.unitCost) || 0),
      0,
    ) + (parseFloat(coinAdjustment) || 0);

  const totalItems = batches.filter(
    (b) => b.productId && b.qtyReceivedBase > 0,
  ).length;

  const isValid =
    !!formData.supplierId &&
    !!formData.purchaseDate &&
    batches.every(
      (b) => b.productId && b.qtyReceivedBase > 0 && parseFloat(b.unitCost) > 0,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      const payload = {
        supplierId: formData.supplierId,
        invoiceNo: formData.invoiceNo.trim() || undefined,
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        totalAmount: totalAmount,
        batches: batches.map((b) => {
          const convs = b.product?.unitConversions;
          return {
            productId: b.productId,
            qtyReceived: b.qtyReceivedBase,
            qtyRemaining: b.qtyReceivedBase,
            unitCost: toBasePrice(b.unitCost, b.selectedUnit, convs),
            sellingPrice: toBasePrice(b.sellingPrice, b.selectedUnit, convs),
            mrp: toBasePrice(b.mrp, b.selectedUnit, convs),
            purchasedUnit: b.selectedUnit,
            conversionQty:
              convs.find((c: any) => c.unitName === b.selectedUnit)
                ?.conversionQty ?? 1,
          };
        }),
      };
      console.log("Submitting payload:", payload);
      await api.post(`purchases`, payload);
      showSuccessToast("Purchase saved successfully");
      router.push("/purchase");
    } catch (err) {
      showErrorToast("Failed to save purchase");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/purchase")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Purchase</h1>
          <p className="text-muted-foreground">Record a supplier invoice</p>
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <PurchaseInfoCard
            formData={formData}
            setFormData={setFormData}
            suppliers={suppliers}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Purchase Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBatch}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* {products.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                  <PackageOpen className="h-8 w-8 mb-2" />
                  <p>No products found.</p>
                </div>
              ) : ( */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[200px]">Product</TableHead>
                      <TableHead className="w-[200px]">Qty & Unit</TableHead>
                      <TableHead className="w-[130px]">Unit Cost</TableHead>
                      <TableHead className="w-[130px]">Sell Price</TableHead>
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
                        batches={batches} // <-- Pass the full array of current batches
                        canRemove={batches.length > 1}
                        focusOnMount={index === newestIndex}
                        onChange={(i: any, updated: any) => {
                          handleBatchChange(i, updated);
                          if (i === newestIndex) setNewestIndex(null);
                        }}
                        onRemove={handleRemoveBatch}
                        sellerId={formData.supplierId}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* )} */}
              <Separator />
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  {totalItems > 0 ? `${totalItems} items ready` : ""}
                </p>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <label
                      htmlFor="coinAdjustment"
                      className="text-xs text-muted-foreground uppercase"
                    >
                      Coin Adjustment
                    </label>
                    <input
                      id="coinAdjustment"
                      type="number"
                      step="0.01"
                      value={coinAdjustment}
                      onChange={(e) => setCoinAdjustment(e.target.value)}
                      className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm text-right"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold">
                    ₹
                    {totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/purchase")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Purchase
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
