"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ReceiptText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fmt, fmtDate } from "@/lib/helpers/functions";
import { SaleDetail } from "@/lib/types";
import { showErrorToast } from "@/lib/helpers/toast";

const BASE = process.env.NEXT_PUBLIC_BASEURL;

interface SaleDetailDialogProps {
  saleId: string | null;
  open: boolean;
  onClose: () => void;
}

export function SaleDetailDialog({
  saleId,
  open,
  onClose,
}: SaleDetailDialogProps) {
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !saleId) {
      setSale(null);
      return;
    }
    setLoading(true);
    axios
      .get(`${BASE}/sales/${saleId}`)
      .then((r) => setSale(r.data.data.sale))
      .catch(() => showErrorToast("Failed to load invoice details"))
      .finally(() => setLoading(false));
  }, [open, saleId]);

  const subtotal =
    sale?.lines.reduce((s, l) => s + l.qty * Number(l.unitSellPrice), 0) ?? 0;
  const totalAmount = Number(sale?.totalAmount ?? 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-muted-foreground" />
            {loading ? "Loading…" : (sale?.invoiceNo ?? "Invoice Details")}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          sale && (
            <div className="space-y-5 py-2">
              {/* Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Invoice No", value: sale.invoiceNo },
                  {
                    label: "Customer",
                    value: sale.customerName ?? sale.customer?.name ?? "—",
                  },
                  { label: "Town", value: sale.customer?.town ?? "—" },
                  { label: "Sale Date", value: fmtDate(sale.saleDate) },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="rounded-lg bg-muted/40 px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold truncate">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Product Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {line.productName}
                          </div>
                          {line.product.sku && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {line.product.sku}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <div className="font-medium">
                            {line.unitQty}{" "}
                            <span className="text-muted-foreground text-xs">
                              {line.unitname}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {fmt(Number(line.unitSellPrice))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-sm">
                          {fmt(Number(line.lineTotal))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end border-t pt-4">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-1.5 mt-1.5">
                    <span>Total</span>
                    <span className="tabular-nums">{fmt(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
