import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Building2, Receipt, Phone, Hash } from "lucide-react";
import { fmt, fmtDate } from "@/lib/helpers/functions";
type PurchaseListItem = {
  id: string;
  supplierId: string;
  supplier: { id: string; name: string };
  invoiceNo: string | null;
  purchaseDate: string;
  totalAmount: number;
  createdAt: string;
  batchCount: number;
};
type PurchaseDetail = {
  id: string;
  supplier: {
    id: string;
    name: string;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    gstNumber: string | null;
    address: string | null;
  };
  invoiceNo: string | null;
  purchaseDate: string;
  totalAmount: number;
  batches: PurchaseBatch[];
  coinAdjustment: number;
};
type PurchaseBatch = {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string | null; baseUnit: string };
  qtyReceived: number;
  qtyRemaining: number;
  unitCost: number;
  sellingPrice: number | null;
  mrp: number | null;
  purchasedUnit: string;
  conversionQty: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface viewProps {
  detailLoading: boolean;
  viewingPurchase: PurchaseDetail | null;
  setViewingPurchase: React.Dispatch<
    React.SetStateAction<PurchaseDetail | null>
  >;
  setDetailLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

function View({
  detailLoading,
  viewingPurchase,
  setViewingPurchase,
  setDetailLoading,
}: viewProps) {
  return (
    <Dialog
      open={detailLoading || !!viewingPurchase}
      onOpenChange={(o) => {
        if (!o) {
          setViewingPurchase(null);
          setDetailLoading(false);
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Purchase Details
          </DialogTitle>
        </DialogHeader>

        {detailLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading details…
          </div>
        )}

        {!detailLoading && viewingPurchase && (
          <div className="space-y-5">
            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/30 border">
              {[
                { label: "Supplier", value: viewingPurchase.supplier.name },
                {
                  label: "Invoice No",
                  value: viewingPurchase.invoiceNo ?? "—",
                },
                {
                  label: "Purchase Date",
                  value: fmtDate(viewingPurchase.purchaseDate),
                },
                {
                  label: "Total Amount",
                  value: fmt(viewingPurchase.totalAmount),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Supplier contact strip */}
            {(viewingPurchase.supplier.contactName ||
              viewingPurchase.supplier.phone ||
              viewingPurchase.supplier.gstNumber) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground px-1">
                {viewingPurchase.supplier.contactName && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {viewingPurchase.supplier.contactName}
                  </span>
                )}
                {viewingPurchase.supplier.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {viewingPurchase.supplier.phone}
                  </span>
                )}
                {viewingPurchase.supplier.gstNumber && (
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    GST: {viewingPurchase.supplier.gstNumber}
                  </span>
                )}
              </div>
            )}

            {/* Batch table */}
            <div>
              <p className="text-sm font-semibold mb-2">
                Items ({viewingPurchase.batches.length})
              </p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Received Qty</TableHead>
                      <TableHead className="text-right">
                        Received Unit
                      </TableHead>

                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Sell</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingPurchase.batches.map((batch) => {
                      const lineTotal =
                        Number(batch.qtyReceived) * Number(batch.unitCost);
                      const stockSold = batch.qtyReceived - batch.qtyRemaining;
                      const stockPct = Math.round(
                        (batch.qtyRemaining / batch.qtyReceived) * 100,
                      );

                      return (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-sm">
                                {batch.product.name}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {batch.product.sku && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {batch.product.sku}
                                  </span>
                                )}
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1 py-0 h-4"
                                >
                                  {batch.product.baseUnit}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="tabular-nums text-sm font-medium">
                                {batch.qtyReceived / batch.conversionQty}
                              </span>
                              {stockSold > 0 ? (
                                <span
                                  className={`text-xs tabular-nums ${
                                    stockPct === 0
                                      ? "text-destructive"
                                      : "text-amber-600"
                                  }`}
                                >
                                  {stockPct === 0
                                    ? "sold out"
                                    : `${batch.qtyRemaining} left`}
                                </span>
                              ) : (
                                <span className="text-xs text-emerald-600">
                                  in stock
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {batch.purchasedUnit}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {fmt(batch.unitCost)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {batch.sellingPrice ? (
                              fmt(batch.sellingPrice)
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {batch.mrp ? (
                              fmt(batch.mrp)
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-sm">
                            {fmt(lineTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {viewingPurchase.batches.length} line item
                {viewingPurchase.batches.length !== 1 ? "s" : ""}
              </p>
              <div className="text-right">
                {!!viewingPurchase.coinAdjustment && (
                  <p className="text-xs text-muted-foreground mb-1 tabular-nums">
                    Coin Adjustment: {fmt(viewingPurchase.coinAdjustment)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Amount
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {fmt(viewingPurchase.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setViewingPurchase(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default View;
