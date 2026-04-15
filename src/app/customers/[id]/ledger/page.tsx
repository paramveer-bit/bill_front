"use client";

import { useEffect, useState, useMemo, useCallback } from "react"; // Added useCallback
import { useParams } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Types & Helpers
import { Customer, LedgerEntry, Meta } from "@/lib/types"; // Added Meta type
import { useDateFilters } from "@/hooks/use-date-filters";
import { AppPagination } from "@/components/AppPagination"; // Import Pagination

// Sub-components
import { CustomerHeader } from "@/components/payments/CustomerHeader";
import { LedgerMetrics } from "@/components/payments/LedgerMetrics";
import { DataTableFilters } from "@/components/Filters";
import { LedgerTable } from "@/components/payments/LedgerTable";

const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20; // Define page size

export default function CustomerLedgerPage() {
  const { id } = useParams();

  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null); // Added Meta state
  const [balanceBF, setBalanceBF] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // Added table loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Memoized fetch function to handle pagination and filters
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
        setMeta(ledgerRes.data.data.meta); // Set meta from backend
      } catch (error) {
        console.error("Failed to fetch ledger");
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

  // If you want server-side searching, you'd add a debounce here like in PurchasePage.
  // Otherwise, this filteredEntries remains for client-side filtering of the current page.
  const filteredEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [entries, searchQuery]);

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  const handleExport = () => {
    if (!customer) return;
    try {
      let csvContent = "CUSTOMER LEDGER STATEMENT\n\n";
      csvContent += `Customer: ${customer.name}\n`;
      csvContent += `GST: ${customer.gstNumber}\n`;
      csvContent += `Location: ${customer.town}\n`;
      csvContent += `Period: ${format(new Date(dateParams?.startDate || new Date()), "dd MMM yyyy")} - ${format(new Date(dateParams?.endDate || new Date()), "dd MMM yyyy")}\n\n`;

      csvContent += "Date,Description,Type,Debit,Credit,Balance\n";
      csvContent += `${format(new Date(dateParams?.startDate || new Date()), "dd/MM/yyyy")},Opening Balance (B/F),OPENING,0,0,${balanceBF}\n`;

      filteredEntries.forEach((entry) => {
        csvContent += `${format(new Date(entry.date), "dd/MM/yyyy")},${entry.desc},${entry.type},${entry.debit},${entry.credit},${entry.runningBalance}\n`;
      });

      csvContent += `\nTotal for Period,,,${totalDebit},${totalCredit},${customer.balance}\n`;

      const element = document.createElement("a");
      const file = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      element.href = URL.createObjectURL(file);
      element.download = `${customer.name}_ledger_${format(new Date(), "dd-MMM-yyyy")}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

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
    return (
      <div className="p-8 text-center text-red-600">Customer not found.</div>
    );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen print:p-0 print:bg-white">
          <CustomerHeader customer={customer} onExport={handleExport} />

          <LedgerMetrics
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            balance={customer.balance}
            startDate={dateParams?.startDate}
            endDate={dateParams?.endDate}
          />

          <Card className="border-0 shadow-sm bg-white print:hidden">
            <CardContent className="pt-6">
              <DataTableFilters
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search description or type..."
                dateFilter={dateFilter}
                onDateFilterChange={(v: any) => {
                  setDateFilter(v);
                  setPage(1); // Reset to page 1 on filter change
                }}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
                onRefresh={() => fetchData()}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="relative">
              {tableLoading && (
                <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <LedgerTable
                entries={filteredEntries}
                balanceBF={balanceBF}
                startDate={dateParams?.startDate}
              />

              {/* Pagination added here */}
              {meta && (
                <div className="p-4 border-t bg-white">
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
