"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import axios from "axios";
import { Supplier } from "@/lib/types"; // CHANGE #1: Import Supplier type instead of Customer
import { format } from "date-fns";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useDateFilters } from "@/hooks/use-date-filters";
import { AppPagination } from "@/components/AppPagination"; // Import Pagination
import { Meta } from "@/lib/types";
import { LedgerEntry } from "@/lib/types";
import SupplierHeader from "@/components/payments/SupplierHeader";
import { LedgerMetrics } from "@/components/payments/LedgerMetrics";
import { DataTableFilters } from "@/components/Filters";
import { LedgerTable } from "@/components/payments/LedgerTable";
const BASE = process.env.NEXT_PUBLIC_BASEURL;
const PAGE_SIZE = 20; // Define page size

// CHANGE #2: Updated component name and documentation
export default function SupplierLedgerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  const [supplier, setSupplier] = useState<Supplier | null>(null); // CHANGE #3: Supplier instead of Customer
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null); // Added Meta state

  const [balanceBF, setBalanceBF] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // Added table loading state

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setIsLoading(true);
      else setTableLoading(true);

      try {
        const [supRes, ledgerRes] = await Promise.all([
          axios.get(`${BASE}/supplier/${id}`),
          axios.get(`${BASE}/supplier/${id}/ledger`, {
            params: {
              ...dateParams,
              page: String(page),
              limit: String(PAGE_SIZE),
            },
          }),
        ]);

        setSupplier(supRes.data.data);
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

  const filteredEntries = useMemo(() => {
    return entries.filter(
      (e) =>
        e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [entries, searchQuery]);

  // CHANGE #5: For suppliers, "debit" = purchases (amount owed), "credit" = payments made
  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-center">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center text-red-600">
          <p>Failed to load supplier data</p>
        </div>
      </div>
    );
  }

  // CHANGE #6: For suppliers, positive balance = amount owed to them
  const isOwed = supplier.balance > 0;

  const handleExport = () => {
    try {
      // Prepare CSV data
      let csvContent = "SUPPLIER LEDGER STATEMENT\n\n"; // CHANGE #7: Updated title
      csvContent += `Supplier: ${supplier.name}\n`; // CHANGE #8: Supplier instead of Customer
      csvContent += `GST: ${supplier.gstNumber}\n`;
      csvContent += `Contact: ${supplier.contactName || "N/A"}\n`; // CHANGE #9: Added contact name
      csvContent += `Period: ${format(new Date(dateParams?.startDate || new Date()), "dd MMM yyyy")} - ${format(new Date(dateParams?.endDate || new Date()), "dd MMM yyyy")}\n\n`;

      csvContent += "Date,Description,Type,Purchases,Payments,Balance\n";

      // Add opening balance
      csvContent += `${format(new Date(dateParams?.startDate || new Date()), "dd/MM/yyyy")},Opening Balance (B/F),OPENING,0,0,${balanceBF}\n`;

      // Add transactions
      filteredEntries.forEach((entry) => {
        csvContent += `${format(new Date(entry.date), "dd/MM/yyyy")},${entry.desc},${entry.type},${entry.debit},${entry.credit},${entry.runningBalance}\n`;
      });

      // Add totals
      csvContent += `\nTotal for Period,,,${totalDebit},${totalCredit},${supplier.balance}\n`;

      // Create blob and download
      const element = document.createElement("a");
      const file = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      element.href = URL.createObjectURL(file);
      element.download = `${supplier.name}_ledger_${format(new Date(), "dd-MMM-yyyy")}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export ledger. Please try again.");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen print:p-0 print:bg-white">
          {/* --- Header Section --- */}
          <SupplierHeader supplier={supplier} onExport={handleExport} />

          {/* --- Key Metrics Cards --- */}
          <LedgerMetrics
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            balance={supplier.balance}
            startDate={dateParams?.startDate}
            endDate={dateParams?.endDate}
          />

          {/* --- Filter Bar --- */}
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

          {/* --- Ledger Table --- */}
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
                    totalRecords={meta.totalRecords}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => setPage(p)}
                    tableLoading={tableLoading}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* --- Print Footer --- */}
          <div className="hidden print:block text-xs text-center text-slate-600 mt-8 pt-4 border-t border-slate-300">
            <p>This is a computer-generated ledger statement</p>
            <p className="mt-2 text-slate-500">
              Generated on {format(new Date(), "dd MMMM yyyy HH:mm")}
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
