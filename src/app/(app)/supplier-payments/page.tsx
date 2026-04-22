"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Wallet, Loader2 } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Shared Helpers & Hooks
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
import { useDateFilters } from "@/hooks/use-date-filters";
import { DataTableFilters } from "@/components/Filters";
import { AppPagination } from "@/components/AppPagination";

// Supplier Components
import { PaymentSummary } from "@/components/supplier/Payment_cards";
import { PaymentRow } from "@/components/supplier/Payment_table_row";
import AddPaymentDialog from "@/components/supplier/AddPaymentDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { SupplierPayment, Meta } from "@/lib/types";
import Header from "@/components/Header";
const BASE = `${process.env.NEXT_PUBLIC_BASEURL}/supplier`;
const PAGE_SIZE = 20;

export default function SupplierPaymentsPage() {
  const { dateFilter, setDateFilter, customRange, setCustomRange, dateParams } =
    useDateFilters("month");

  // --- States ---
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingTarget, setDeletingTarget] = useState<{
    supplierId: string;
    paymentId: string;
  } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search Debounce Logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  const fetchPayments = useCallback(
    async (isInitial = false) => {
      if (dateFilter === "custom" && (!customRange.start || !customRange.end))
        return;

      if (isInitial) setLoading(true);
      else setTableLoading(true);

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          ...dateParams,
          ...(debouncedSearch && { search: debouncedSearch }),
        };

        const { data } = await axios.get(`${BASE}/payments/getAll`, { params });
        const records = Array.isArray(data.data)
          ? data.data
          : data.data.payments || [];

        setPayments(records);
        if (data.data.meta) setMeta(data.data.meta);
      } catch (err) {
        showErrorToast("Failed to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    },
    [debouncedSearch, dateParams, dateFilter, customRange, page],
  );

  useEffect(() => {
    fetchPayments(loading);
  }, [fetchPayments]);

  const handleDelete = async () => {
    if (deletingTarget === null) return;
    setDeleting(true);
    const { supplierId: sId, paymentId: pId } = deletingTarget;
    try {
      await axios.delete(`${BASE}/${sId}/payments/${pId}`);
      showSuccessToast("Payment deleted");
      fetchPayments();
    } catch (err) {
      showErrorToast("Delete failed");
    } finally {
      setDeletingTarget(null);
      setDeleting(false);
    }
  };

  const total = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Supplier Payments"
        description="Manage outgoing settlement history"
      />
      <div className="p-6 space-y-5">
        {/* <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" /> Supplier Payments
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage outgoing settlement history
            </p>
          </div>

          New Dialog Component
        </div> */}
        <AddPaymentDialog
          fetchPayments={() => fetchPayments()}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
        <PaymentSummary
          totalAmount={total}
          count={payments.length}
          thisMonthAmount={total}
          dateFilter={dateFilter}
          startDate={
            customRange.start ? new Date(customRange.start) : undefined
          }
          endDate={customRange.end ? new Date(customRange.end) : undefined}
        />

        <Card className="overflow-hidden gap-0">
          <CardHeader className=" px-4 border-b py-0 mb-0 gap-0">
            {/* --------------------------------- CENTRALIZED FILTERS ------------------------------ */}
            <DataTableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search reference or remarks..."
              dateFilter={dateFilter}
              onDateFilterChange={(v: any) => {
                setDateFilter(v);
                setPage(1);
              }}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
              onRefresh={() => fetchPayments()}
              newTrigger={() => setIsDialogOpen(true)}
              buttonTitle="Add Payment"
            />
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 pl-4">
                      <Loader2 className="mx-auto animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No records found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <PaymentRow
                      key={p.id}
                      payment={p}
                      onDelete={() =>
                        setDeletingTarget({
                          supplierId: p.supplier.id,
                          paymentId: p.id,
                        })
                      }
                      isDeleting={
                        deleting && deletingTarget?.paymentId === p.id
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>

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
      <DeleteConfirmDialog
        open={deletingTarget !== null}
        title="Payment"
        message=<>
          Are you sure you want to delete payment entry of{" "}
          <span className="font-semibold text-foreground">
            {payments.map((p) =>
              p.id === deletingTarget?.paymentId
                ? p.supplier.name + " of amount: " + p.amount || "this payment"
                : null,
            )}
          </span>
          ? This cannot be undone.
        </>
        onConfirm={handleDelete}
        onCancel={() => setDeletingTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
