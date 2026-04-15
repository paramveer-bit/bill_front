"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";

import { CustomerCombobox } from "@/components/sales/new/CustomerCombobox";
import { SaleRowItem } from "@/components/sales/new/SaleRowItem";
import { Customer, SaleRow } from "@/lib/types";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

// -- Duplicate Types for Self-Containment --

const emptyRow = (): SaleRow => ({
  productId: "",
  qtyInput: "",
  selectedUnit: "",
  qtyBase: 0,
  sellPrice: "",
  product: null,
  stockBase: null,
  loadingStock: false,
});

export default function NewSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [rows, setRows] = useState<SaleRow[]>([emptyRow()]);
  const [newestIndex, setNewestIndex] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get(`${BASE}/customer`)
      .then((res) => setCustomers(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setNewestIndex(rows.length);
  };

  const handleRowChange = (index: number, updated: SaleRow) =>
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)));

  const totalAmount = rows.reduce(
    (s, r) =>
      s + (parseFloat(r.qtyInput) || 0) * (parseFloat(r.sellPrice) || 0),
    0,
  );

  const isValid =
    !!customerId &&
    rows.every(
      (r) => r.productId && r.qtyBase > 0 && parseFloat(r.sellPrice) > 0,
    );

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const payload = {
        customerId,
        saleDate: new Date(saleDate).toISOString(),
        totalAmount: rows.reduce((s, r) => {
          const conv =
            r.product.unitConversions.find(
              (c: any) => c.unitName === r.selectedUnit,
            )?.conversionQty ?? 1;
          return s + r.qtyBase * ((parseFloat(r.sellPrice) || 0) / conv);
        }, 0),
        lines: rows.map((r) => ({
          productId: r.productId,
          qty: r.qtyBase,
          unitQty: parseFloat(r.qtyInput),
          unitName: r.selectedUnit,
          unitSellPrice:
            (parseFloat(r.sellPrice) || 0) /
            (r.product.unitConversions.find(
              (c: any) => c.unitName === r.selectedUnit,
            )?.conversionQty ?? 1),
        })),
      };
      await axios.post(`${BASE}/sales`, payload);
      showSuccessToast("Invoice created");
      router.push("/sales");
    } catch {
      showErrorToast("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/sales")}
            >
              <ArrowLeft />
            </Button>
            <h1 className="text-3xl font-bold">New Invoice</h1>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="animate-spin inline" />
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CustomerCombobox
                    customers={customers}
                    value={customerId}
                    onChange={setCustomerId}
                  />
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="border p-2 rounded h-10"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle className="text-base">Invoice Items</CardTitle>
                  <Button onClick={handleAddRow} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-[240px]">Product</TableHead>
                        <TableHead className="w-[200px]">Qty</TableHead>
                        <TableHead className="w-[150px]">Price</TableHead>
                        <TableHead className="w-[120px]"></TableHead>
                        <TableHead className="w-[120px]"></TableHead>

                        <TableHead className="text-right">Total</TableHead>
                        {/* <TableHead className="w-10" /> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <SaleRowItem
                          key={idx}
                          row={row}
                          index={idx}
                          canRemove={rows.length > 1}
                          focusOnMount={idx === newestIndex}
                          onChange={handleRowChange}
                          onRemove={(i: any) =>
                            setRows((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 border-t flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {rows.length} rows
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push("/sales")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || submitting}
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Create Invoice
                </Button>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
