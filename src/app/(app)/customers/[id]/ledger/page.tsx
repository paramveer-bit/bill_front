"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Types & Helpers
import { Customer, LedgerEntry, Meta } from "@/lib/types";
import { useDateFilters } from "@/hooks/use-date-filters";
import { AppPagination } from "@/components/AppPagination";

// Sub-components
import { CustomerHeader } from "@/components/payments/CustomerHeader";
import { LedgerMetrics } from "@/components/payments/LedgerMetrics";
import { DataTableFilters } from "@/components/Filters";
import { LedgerTable } from "@/components/payments/LedgerTable";

// Reusable Print View
import { fmtDate } from "@/lib/helpers/functions";
const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20;

export default function CustomerLedgerPage() {
  const { id } = useParams();

  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [balanceBF, setBalanceBF] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setIsLoading(true);
      else setTableLoading(true);

      try {
        const [custRes, ledgerRes] = await Promise.all([
          axios.get(`${BASE}/customer/${id}`),
          axios.get(`${BASE}/customer/${id}/ledger`, {
            params: {
              ...dateParams,
              page: String(page),
              limit: String(PAGE_SIZE),
            },
          }),
        ]);

        setCustomer(custRes.data.data);
        setEntries(ledgerRes.data.data.ledger || []);
        setBalanceBF(ledgerRes.data.data.balanceBF || 0);
        setMeta(ledgerRes.data.data.meta);
      } catch (error) {
        console.error("Failed to fetch ledger", error);
      } finally {
        setIsLoading(false);
        setTableLoading(false);
      }
    },
    [id, dateParams, dateFilter, customRange, page],
  );

  useEffect(() => {
    fetchData(isLoading);
  }, [fetchData]);

  const filteredEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [entries, searchQuery]);

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto" />
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!customer)
    return <div className="p-8 text-center">Customer not found.</div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
          {/* Header Section (Always Visible) */}
          <CustomerHeader customer={customer} />

          {/* HIDDEN DURING PRINT (Metric Cards) */}
          <div className="print:hidden">
            <LedgerMetrics
              totalDebit={totalDebit}
              totalCredit={totalCredit}
              balance={customer.balance}
              startDate={dateParams?.startDate}
              endDate={dateParams?.endDate}
            />
          </div>

          {/* HIDDEN DURING PRINT (Filter Controls) */}
          <Card className="border-0 shadow-sm bg-white print:hidden">
            <CardContent className="pt-6">
              <DataTableFilters
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search entries..."
                dateFilter={dateFilter}
                onDateFilterChange={(v: any) => {
                  setDateFilter(v);
                  setPage(1);
                }}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
                onRefresh={() => fetchData()}
              />
            </CardContent>
          </Card>

          {/* Table Container (Print Friendly Layout) */}
          <Card className="border-0 shadow-sm overflow-hidden print:shadow-none print:border-0 ">
            {/* Show an extra header only when browser prints (Ctrl+P) */}
            <div className="hidden print:block p-4 border-b border-black mb-4">
              <h1 className="text-xl font-bold uppercase">
                Statement of Account: {customer.name}
              </h1>

              {/* Mobile and Address section */}
              <div className="text-sm mt-1">
                <p>
                  <strong>Mobile:</strong> {customer.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {customer.address || "No address provided"}
                </p>
              </div>

              <p className="text-xs italic text-zinc-600 mt-2">
                Period: {fmtDate(dateParams?.startDate || "")} to{" "}
                {fmtDate(dateParams?.endDate || "")}
              </p>
            </div>

            <div className="relative">
              {tableLoading && (
                <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center print:hidden">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              <LedgerTable
                entries={filteredEntries}
                balanceBF={balanceBF}
                startDate={dateParams?.startDate}
              />

              {meta && (
                <div className="p-4 border-t bg-white print:hidden">
                  <AppPagination
                    page={page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => setPage(p)}
                    tableLoading={tableLoading}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
