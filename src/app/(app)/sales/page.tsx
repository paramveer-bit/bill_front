"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Loader2, Plus, Printer } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Shared Helpers & Types
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
import { SaleListItem, SortField, Meta, SaleDetail } from "@/lib/types"; // Import Meta instead of Pagination

// Centralized Hooks and Shared UI
import { useDateFilters } from "@/hooks/use-date-filters";
import { AppPagination } from "@/components/AppPagination";

// Sub-components
import { SaleStatCards } from "@/components/sales/SaleStatCards";
import { DataTableFilters } from "@/components/Filters";
import { SaleTable } from "@/components/sales/SaleTable";
import { SaleDetailDialog } from "@/components/sales/SaleDetailDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { BatchInvoicePrinter } from "@/components/sales/BatchInvoicePrinter";
import { useReactToPrint } from "react-to-print";
import Header from "@/components/Header";
import { useApi } from "@/hooks/useApi";
const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20;

export default function SalesPage() {
  const router = useRouter();

  // --- Centralized Date State ---
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  // --- Data State ---
  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null); // Consistent with PurchasePage

  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("saleDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [summary, setSummary] = useState({
    sales: 0,
    spend: 0,
    totalLine: 0,
  });
  // ---------------------------------- For Prinitng Invoices--------------------------------------
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchData, setBatchData] = useState<SaleDetail[]>([]);
  const [isPreparingBatch, setIsPreparingBatch] = useState(false);
  const batchPrintRef = useRef(null);
  // --- Dialog State ---
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = useApi();
  // ── Search Debouncing ─────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchSales = useCallback(
    async (isInitial = false) => {
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setLoading(true);
      else setTableLoading(true);

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          sortBy,
          sortOrder,
          ...dateParams,
          ...(debouncedSearch && { search: debouncedSearch }),
        };

        const res = await api.get(`/sales`, { params });
        setSales(res.data.data.sales);
        setMeta(res.data.data.meta); // Now using meta from backend
        setSummary({
          sales: res.data.data.summary.totalSales, // Total sales count from meta
          spend: res.data.data.summary.totalSpend, // Total spend from meta
          totalLine: res.data.data.summary.totalLineItems, // Total line items from meta
        });
      } catch (err) {
        const error = err as AxiosError<any>;
        showErrorToast(error.response?.data?.message || "Failed to load sales");
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    },
    [
      page,
      debouncedSearch,
      dateParams,
      dateFilter,
      customRange,
      sortBy,
      sortOrder,
    ],
  );

  useEffect(() => {
    fetchSales(loading);
  }, [fetchSales]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setPage(1);
  }, [sortBy, sortOrder, dateFilter]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/sales/${deleteTarget.id}`);
      showSuccessToast(`Invoice ${deleteTarget.invoiceNo} deleted`);
      setDeleteTarget(null);
      fetchSales();
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to delete invoice",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Fetch full invoice details when print dialog opens
  // const handlePrintInvoice = async (saleId: string) => {
  //   try {
  //     const res = await axios.get(`${BASE}/sales/${saleId}`);
  //     setSelectedInvoice(res.data.data);
  //     setPrintOpen(true);
  //   } catch (err) {
  //     const error = err as AxiosError<any>;
  //     showErrorToast(
  //       error.response?.data?.message || "Failed to load invoice details",
  //     );
  //   }
  // };

  // Hook for batch printing
  const handleBatchPrintTrigger = useReactToPrint({
    contentRef: batchPrintRef,
    documentTitle: "Batch_Invoices",
  });

  const fetchInvoiceDetails = async (id: string) => {
    console.log(id);
    try {
      const res = await axios.get(`${BASE}/sales/${id}`);
      return res.data.data.sale;
    } catch (error) {
      const err = error as AxiosError<any>;
      throw new Error(
        err.response?.data?.message || `Failed to load sales ${id}`,
      );
    }
  };
  const onBatchPrint = async () => {
    setIsPreparingBatch(true);
    try {
      // 1. Fetch full details for all selected IDs
      // You need full line items for printing, which the table might not have
      const fullInvoices = await Promise.all(
        selectedIds.map((id) => fetchInvoiceDetails(id)),
      );
      setBatchData(fullInvoices);

      // 2. Small timeout to allow React to render the hidden component
      setTimeout(() => {
        handleBatchPrintTrigger();
        setIsPreparingBatch(false);
      }, 500);
    } catch (error) {
      console.error("Batch print failed", error);
      setIsPreparingBatch(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Sales & Invoices"
        description="Track and manage your inventory sales and customer invoices"
      />
      <div className="p-6 space-y-5 max-w-[1400px]">
        {/* -------------------------Summary Cards------------------------ */}
        {!loading && summary && (
          <SaleStatCards
            summary={{
              purchases: summary.sales,
              spend: summary.spend,
              totalLine: summary.totalLine,
            }}
            option={"sale"}
          />
        )}
        {/*-----------------------------Filters---------------------------  */}

        {/* ----------------------------Table------------------------------ */}
        <Card className="overflow-hidden gap-0">
          <CardHeader className=" px-4 border-b py-0 mb-0 gap-0">
            {/* --------------------------------- CENTRALIZED FILTERS ------------------------------ */}
            <DataTableFilters
              searchTerm={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search invoice or customer"
              dateFilter={dateFilter}
              onDateFilterChange={(v: any) => {
                setDateFilter(v);
                setPage(1);
              }}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              onRefresh={() => fetchSales()}
              newTrigger={() => router.push("/sales/new")}
              buttonTitle="New Sale"
            />
          </CardHeader>
          <CardContent className="p-0">
            {/* <div className="flex justify-between mb-4 px-5"> */}
            {selectedIds.length > 0 && (
              <Button onClick={onBatchPrint} disabled={isPreparingBatch}>
                {isPreparingBatch ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Printer className="mr-2" />
                )}
                Print Selected ({selectedIds.length})
              </Button>
            )}
            {/* </div> */}
            <SaleTable
              sales={sales}
              loading={loading}
              tableLoading={tableLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onView={setViewId}
              onDelete={setDeleteTarget}
              // onPrint={handlePrintInvoice} // Add this prop
              selectedIds={selectedIds}
              onSelectRow={(id: string) =>
                setSelectedIds((prev) =>
                  prev.includes(id)
                    ? prev.filter((i) => i !== id)
                    : [...prev, id],
                )
              }
              onSelectAll={(ids: string[]) => setSelectedIds(ids)}
            />

            {/* --- PERFECTLY CONSISTENT PAGINATION --- */}
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
          </CardContent>
        </Card>
      </div>

      <SaleDetailDialog
        saleId={viewId}
        open={viewId !== null}
        onClose={() => setViewId(null)}
      />
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Invoice"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.invoiceNo}
            </span>
            ? This will reverse all stock and balance changes. This cannot be
            undone.
          </>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
      <BatchInvoicePrinter
        ref={batchPrintRef}
        invoices={batchData}
        companyName="YOUR COMPANY"
      />
    </div>
  );
}
