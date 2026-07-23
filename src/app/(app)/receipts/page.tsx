"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";

// Hooks & Helpers
import { useDateFilters } from "@/hooks/use-date-filters";
import { Meta } from "@/lib/types";
// Sub-components
import { Receipt } from "@/lib/types";
import { ReceiptStats } from "@/components/receipts/ReceiptStats";
import { ReceiptTable } from "@/components/receipts/ReceiptTable";
import { AppPagination } from "@/components/AppPagination";
import { DataTableFilters } from "@/components/Filters";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import AddNewReceipt from "@/components/receipts/New_edit";
import axios from "axios";
import Header from "@/components/Header";
import { useApi } from "@/hooks/useApi";
const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 30;

export default function ReceiptsPage() {
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [summary, setSummary] = useState({
    totalReceived: 0,
    receiptsCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const api = useApi();
  const fetchReceipts = useCallback(
    async (isInitial = false) => {
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setIsLoading(true);
      else setTableLoading(true);

      try {
        const params = new URLSearchParams({
          ...dateParams,
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (searchTerm) params.append("search", searchTerm);

        const res = await api.get(`/receipts?${params.toString()}`);
        setReceipts(res.data.data.receipts || []);
        setMeta(res.data.data.meta);
        setSummary({
          totalReceived: res.data.data.summary.totalReceived || 0,
          receiptsCount: res.data.data.summary.receiptsCount || 0,
        });
      } catch (err) {
        showErrorToast("Failed to load receipts");
      } finally {
        setIsLoading(false);
        setTableLoading(false);
      }
    },
    [searchTerm, dateParams, dateFilter, customRange, page],
  );

  useEffect(() => {
    fetchReceipts(isLoading);
  }, [fetchReceipts]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/receipts/${deleteTarget}`);
      showSuccessToast("Receipt deleted successfully!");
      fetchReceipts();
    } catch (err) {
      showErrorToast("Failed to delete receipt");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Payment Receipts"
        description="Track and manage customer payments"
      />
      <div className="p-6 space-y-6">
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment Receipts</h1>
            <p className="text-muted-foreground">
              Track and manage customer payments
            </p>
          </div> */}
        <AddNewReceipt
          fetchReceipts={fetchReceipts}
          isDialogOpen={isAddDialogOpen}
          setIsDialogOpen={setIsAddDialogOpen}
        />
        {/* </div> */}

        <ReceiptStats
          totalCount={summary.receiptsCount || 0}
          totalAmount={summary.totalReceived || 0}
          dateFilter={dateFilter}
        />

        <Card className="overflow-hidden gap-0">
          <CardHeader className=" px-4 border-b py-0 mb-0 gap-0">
            <DataTableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search customer or remarks"
              dateFilter={dateFilter}
              onDateFilterChange={(v: any) => {
                setDateFilter(v);
                setPage(1);
              }}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              onRefresh={() => fetchReceipts()}
              newTrigger={() => setIsAddDialogOpen(true)}
              buttonTitle="Add Receipt"
            />
          </CardHeader>

          <CardContent className="p-0">
            <ReceiptTable
              receipts={receipts}
              isLoading={isLoading}
              tableLoading={tableLoading}
              onDelete={setDeleteTarget}
              isDeleting={deleting}
              deleteTarget={deleteTarget}
            />

            {meta && meta.totalPages > 1 && (
              <AppPagination
                page={page}
                totalPages={meta.totalPages}
                totalRecords={meta.totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                tableLoading={tableLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title="Receipt"
        message=<>
          Are you sure you want to delete payment entry of{" "}
          <span className="font-semibold text-foreground">
            {receipts.map((p) =>
              p.id === deleteTarget
                ? p.customer.name + " of amount: " + p.amount || "this payment"
                : null,
            )}
          </span>
          ? This cannot be undone.
        </>
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
