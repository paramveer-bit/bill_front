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
import { ReceiptStats } from "@/components/receipts/ReceiptStats";
import { ReceiptTable } from "@/components/receipts/ReceiptTable";
import { AppPagination } from "@/components/AppPagination";
import { DataTableFilters } from "@/components/Filters";

import AddNewReceipt from "@/components/receipts/New_edit";
import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 30;

export default function ReceiptsPage() {
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [receipts, setReceipts] = useState([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [page, setPage] = useState(1);

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

        const res = await axios.get(`${BASE}/receipts?${params.toString()}`);
        setReceipts(res.data.data.receipts || []);
        setMeta(res.data.data.meta);
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

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    setIsDeleting(id);
    try {
      await fetch(`${BASE}/receipts/${id}`, { method: "DELETE" });
      showSuccessToast("Receipt deleted successfully!");
      fetchReceipts();
    } catch (err) {
      showErrorToast("Failed to delete receipt");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payment Receipts</h1>
              <p className="text-muted-foreground">
                Track and manage customer payments
              </p>
            </div>
            <AddNewReceipt
              fetchReceipts={fetchReceipts}
              isDialogOpen={isAddDialogOpen}
              setIsDialogOpen={setIsAddDialogOpen}
            />
          </div>

          <ReceiptStats
            totalCount={meta?.total || 0}
            totalAmount={meta?.totalSpend || 0}
            dateFilter={dateFilter}
          />

          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
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
              />
            </CardHeader>

            <CardContent className="p-0">
              <ReceiptTable
                receipts={receipts}
                isLoading={isLoading}
                tableLoading={tableLoading}
                onDelete={handleDeleteReceipt}
                isDeleting={isDeleting}
              />

              {meta && meta.totalPages > 1 && (
                <AppPagination
                  page={page}
                  totalPages={meta.totalPages}
                  totalItems={meta.total}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                  tableLoading={tableLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
