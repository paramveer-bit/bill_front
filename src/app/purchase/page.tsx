"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye,
  Trash2,
  Loader2,
  PackageOpen,
  Building2,
  Receipt,
  TrendingUp,
  Hash,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import axios, { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers/toast";

// Centralized Hooks, Config, and Shared UI Components
import { useDateFilters } from "@/hooks/use-date-filters";
import { AppPagination } from "@/components/AppPagination";
import { DataTableFilters } from "@/components/Filters"; // Using the new centralized Filters component
import View from "@/components/purchase/View";
import { fmt, fmtDate } from "@/lib/helpers/functions";
import { PurchaseListItem, PurchaseDetail, Meta } from "@/lib/types";
import { SaleStatCards } from "@/components/sales/SaleStatCards";

const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20;

export default function PurchasePage() {
  const router = useRouter();

  // --- Centralized Date State ---
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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
    async (isInitial = false) => {
      // Guard for custom range
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setLoading(true);
      else setTableLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...dateParams,
        });

        if (search) params.set("search", search);

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
    [page, search, dateParams, dateFilter, customRange],
  );

  useEffect(() => {
    fetchPurchases(loading);
  }, [fetchPurchases]);

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

  // ── View detail ───────────────────────────────────────────────────────────

  const handleView = async (id: string) => {
    setViewingPurchase(null);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${BASE}/purchases/${id}`);
      setViewingPurchase(res.data.data);
    } catch (err) {
      showErrorToast("Failed to load purchase details");
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
      setDeletingPurchase(null);
      fetchPurchases();
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to delete purchase",
      );
    } finally {
      setDeletingId(null);
    }
  };

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
              <Plus className="mr-2 h-4 w-4" /> New Purchase
            </Button>
          </div>

          {/* Summary strip */}
          {!loading && meta && (
            <SaleStatCards
              summary={{
                purchases: meta.total,
                spend: meta.totalSpend,
                totalLine: meta.totalLineItems,
              }}
              option={"purchase"}
            />
          )}

          {/* Table card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 pt-4 px-4 border-b">
              {/* --------------------------------- CENTRALIZED FILTERS ------------------------------ */}
              <DataTableFilters
                searchTerm={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Search supplier or invoice..."
                dateFilter={dateFilter}
                onDateFilterChange={(v: any) => {
                  setDateFilter(v);
                  setPage(1);
                }}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
                onRefresh={() => fetchPurchases()}
              />
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading
                  purchases…
                </div>
              ) : (
                <div className="relative">
                  {tableLoading && (
                    <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
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
                          <TableCell className="pl-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-medium">
                                {purchase.invoiceNo || "No Invoice"}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                <Hash className="h-2.5 w-2.5" /> {purchase.id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {purchase.supplier.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {fmtDate(purchase.purchaseDate)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              {purchase.batchCount} items
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            {fmt(purchase.totalAmount)}
                          </TableCell>
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
                            <PackageOpen className="h-10 w-10 mx-auto opacity-30 mb-2" />
                            <p className="text-muted-foreground">
                              No purchases found
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* CENTRALIZED PAGINATION */}
                  {meta && (
                    <AppPagination
                      page={page}
                      totalPages={meta.totalPages}
                      totalItems={meta.total}
                      pageSize={PAGE_SIZE}
                      onPageChange={(p) => setPage(p)}
                      tableLoading={tableLoading}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <View
          detailLoading={detailLoading}
          viewingPurchase={viewingPurchase}
          setViewingPurchase={setViewingPurchase}
          setDetailLoading={setDetailLoading}
        />

        <AlertDialog
          open={!!deletingPurchase}
          onOpenChange={(o) => !o && setDeletingPurchase(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this purchase?</AlertDialogTitle>
              <AlertDialogDescription>
                Purchase{" "}
                <span className="font-semibold">
                  {deletingPurchase?.invoiceNo ?? "record"}
                </span>{" "}
                from{" "}
                <span className="font-semibold">
                  {deletingPurchase?.supplier.name}
                </span>{" "}
                will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
