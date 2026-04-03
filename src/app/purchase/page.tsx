"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  Loader2,
  PackageOpen,
  Building2,
  Receipt,
  Phone,
  Hash,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers";

const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

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

type PurchaseBatch = {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string | null; baseUnit: string };
  qtyReceived: number;
  qtyRemaining: number;
  unitCost: number;
  sellingPrice: number | null;
  mrp: number | null;
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
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalSpend: number;
  totalLineItems: number;
};

type DateFilter =
  | "1day"
  | "week"
  | "month"
  | "prevmonth"
  | "quarter"
  | "custom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number | string) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const DATE_FILTER_LABEL: Record<DateFilter, string> = {
  "1day": "last 24 hours",
  week: "last 7 days",
  month: "this month",
  prevmonth: "previous month",
  quarter: "this quarter",
  custom: "custom range",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PurchasePage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [viewingPurchase, setViewingPurchase] = useState<PurchaseDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const [deletingPurchase, setDeletingPurchase] =
    useState<PurchaseListItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchPurchases = useCallback(
    async (opts: {
      page: number;
      search: string;
      dateFilter: DateFilter;
      from?: string;
      to?: string;
      isInitial?: boolean;
    }) => {
      if (opts.isInitial) setLoading(true);
      else setTableLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(opts.page),
          limit: String(PAGE_SIZE),
          dateFilter: opts.dateFilter,
        });
        if (opts.search) params.set("search", opts.search);
        if (opts.dateFilter === "custom") {
          if (opts.from) params.set("from", opts.from);
          if (opts.to) params.set("to", opts.to);
        }

        const res = await axios.get(`${BASE}/purchases?${params}`);
        setPurchases(res.data.data.purchases);
        setMeta(res.data.data.meta);
      } catch (err) {
        const error = err as AxiosError<any>;
        showErrorToast(
          error.response?.data?.message || "Failed to load purchases",
        );
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchPurchases({
      page: 1,
      search: "",
      dateFilter: "month",
      isInitial: true,
    });
  }, [fetchPurchases]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // Re-fetch on page / search / filter change (skip first render + skip custom)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (dateFilter === "custom") return;
    fetchPurchases({ page, search, dateFilter });
  }, [page, search, dateFilter, fetchPurchases]);

  const handleDateFilter = (val: DateFilter) => {
    setDateFilter(val);
    setPage(1);
  };

  const handleApplyCustom = () => {
    if (!customFrom && !customTo) return;
    setAppliedFrom(customFrom);
    setAppliedTo(customTo);
    setPage(1);
    fetchPurchases({
      page: 1,
      search,
      dateFilter: "custom",
      from: customFrom,
      to: customTo,
    });
  };

  const handleClearCustom = () => {
    setCustomFrom("");
    setCustomTo("");
    setAppliedFrom("");
    setAppliedTo("");
    handleDateFilter("month");
  };

  // ── View detail ───────────────────────────────────────────────────────────

  const handleView = async (id: string) => {
    setViewingPurchase(null);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${BASE}/purchases/${id}`);
      setViewingPurchase(res.data.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to load purchase details",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingPurchase) return;
    try {
      setDeletingId(deletingPurchase.id);
      await axios.delete(`${BASE}/purchases/${deletingPurchase.id}`);
      const newTotal = (meta?.total ?? 1) - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE);
      const targetPage =
        page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      setDeletingPurchase(null);
      fetchPurchases({
        page: targetPage,
        search,
        dateFilter,
        from: appliedFrom,
        to: appliedTo,
      });
      if (targetPage !== page) setPage(targetPage);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to delete purchase",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = meta?.totalPages ?? 1;

  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Track and manage your inventory purchases
              </p>
            </div>
            <Button onClick={() => router.push("/purchase/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Purchase
            </Button>
          </div>

          {/* Summary strip */}
          {!loading && meta && meta.total > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Purchases",
                  value: meta.total.toLocaleString("en-IN"),
                  sub: DATE_FILTER_LABEL[dateFilter],
                  icon: Receipt,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Total Spend",
                  value: fmt(meta.totalSpend),
                  sub: DATE_FILTER_LABEL[dateFilter],
                  icon: TrendingUp,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  label: "Line Items",
                  value: meta.totalLineItems.toLocaleString("en-IN"),
                  sub: `page ${meta.page} of ${meta.totalPages}`,
                  icon: PackageOpen,
                  color: "bg-violet-50 text-violet-600",
                },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold tabular-nums leading-snug truncate">
                        {value}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sub}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table card */}
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search supplier or invoice…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 pr-9"
                    />
                    {searchInput && (
                      <button
                        onClick={() => setSearchInput("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Date filter */}
                  <Select
                    value={dateFilter}
                    onValueChange={(v) => handleDateFilter(v as DateFilter)}
                  >
                    <SelectTrigger className="w-full sm:w-[175px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">Last 24 Hours</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="prevmonth">Previous Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom range row */}
                {dateFilter === "custom" && (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/40 border">
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                      <label className="text-xs text-muted-foreground shrink-0 w-7">
                        From
                      </label>
                      <Input
                        type="date"
                        value={customFrom}
                        max={customTo || todayStr()}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                      <label className="text-xs text-muted-foreground shrink-0 w-7">
                        To
                      </label>
                      <Input
                        type="date"
                        value={customTo}
                        min={customFrom}
                        max={todayStr()}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      disabled={!customFrom && !customTo}
                      onClick={handleApplyCustom}
                    >
                      Apply
                    </Button>
                    {(appliedFrom || appliedTo) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-muted-foreground shrink-0"
                        onClick={handleClearCustom}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading purchases…
                </div>
              ) : (
                <div className="relative">
                  {/* Soft overlay while re-fetching */}
                  {tableLoading && (
                    <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center rounded-b-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="pl-4">Invoice</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right pr-4 w-[90px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id} className="h-14">
                          {/* Invoice */}
                          <TableCell className="pl-4">
                            <div className="flex flex-col">
                              {purchase.invoiceNo ? (
                                <span className="font-mono text-sm font-medium">
                                  {purchase.invoiceNo}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">
                                  No invoice
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                <Hash className="h-2.5 w-2.5" />
                                {purchase.id}
                              </span>
                            </div>
                          </TableCell>

                          {/* Supplier */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="font-medium text-sm">
                                {purchase.supplier.name}
                              </span>
                            </div>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              {fmtDate(purchase.purchaseDate)}
                            </div>
                          </TableCell>

                          {/* Items count */}
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="text-xs tabular-nums"
                            >
                              {purchase.batchCount} item
                              {purchase.batchCount !== 1 ? "s" : ""}
                            </Badge>
                          </TableCell>

                          {/* Total */}
                          <TableCell className="text-right font-semibold tabular-nums text-sm">
                            {fmt(purchase.totalAmount)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleView(purchase.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={deletingId === purchase.id}
                                onClick={() => setDeletingPurchase(purchase)}
                              >
                                {deletingId === purchase.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {purchases.length === 0 && !tableLoading && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <PackageOpen className="h-10 w-10 opacity-30" />
                              <div>
                                <p className="font-medium">
                                  No purchases match your filters
                                </p>
                                <p className="text-xs mt-0.5">
                                  Try a different search term or date range
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/purchase/new")}
                              >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                New Purchase
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {(page - 1) * PAGE_SIZE + 1}–
                          {Math.min(page * PAGE_SIZE, meta.total)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {meta.total.toLocaleString("en-IN")}
                        </span>
                      </p>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={page === 1 || tableLoading}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((p, i) =>
                          p === "…" ? (
                            <span
                              key={`ellipsis-${i}`}
                              className="w-8 text-center text-sm text-muted-foreground"
                            >
                              …
                            </span>
                          ) : (
                            <Button
                              key={p}
                              variant={p === page ? "default" : "outline"}
                              size="icon"
                              className="h-8 w-8 text-xs"
                              disabled={tableLoading}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          ),
                        )}

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={page === totalPages || tableLoading}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── View Dialog ── */}
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
                          <TableHead className="text-right">Received</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Sell</TableHead>
                          <TableHead className="text-right">MRP</TableHead>
                          <TableHead className="text-right">
                            Line Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingPurchase.batches.map((batch) => {
                          const lineTotal =
                            Number(batch.qtyReceived) * Number(batch.unitCost);
                          const stockSold =
                            batch.qtyReceived - batch.qtyRemaining;
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
                                    {batch.qtyReceived}
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
                                {fmt(batch.unitCost)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm">
                                {batch.sellingPrice ? (
                                  fmt(batch.sellingPrice)
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-sm">
                                {batch.mrp ? (
                                  fmt(batch.mrp)
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
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
              <Button
                variant="outline"
                onClick={() => setViewingPurchase(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ── */}
        <AlertDialog
          open={!!deletingPurchase}
          onOpenChange={(o) => !o && setDeletingPurchase(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this purchase?</AlertDialogTitle>
              <AlertDialogDescription>
                Purchase{" "}
                <span className="font-semibold text-foreground">
                  {deletingPurchase?.invoiceNo ?? `#${deletingPurchase?.id}`}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-foreground">
                  {deletingPurchase?.supplier.name}
                </span>{" "}
                will be permanently deleted. This will fail if any items have
                already been sold against this purchase.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Purchase
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
