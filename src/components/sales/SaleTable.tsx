import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { fmt, fmtDate } from "@/lib/helpers/functions";
import { SaleListItem, SortField } from "@/lib/types";

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== field)
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-primary" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-primary" />
  );
}

export function SaleTable({
  sales,
  loading,
  tableLoading,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onDelete,
}: any) {
  return (
    <div className="overflow-x-auto relative">
      {tableLoading && (
        <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[160px]">
              <button
                onClick={() => onSort("invoiceNo")}
                className="flex items-center gap-1.5 font-medium"
              >
                Invoice No{" "}
                <SortIcon
                  field="invoiceNo"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </button>
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="w-[130px]">
              <button
                onClick={() => onSort("saleDate")}
                className="flex items-center gap-1.5 font-medium"
              >
                Date{" "}
                <SortIcon
                  field="saleDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </button>
            </TableHead>
            <TableHead className="w-[60px] text-center">Items</TableHead>
            <TableHead className="w-[150px]">
              <button
                onClick={() => onSort("totalAmount")}
                className="flex items-center gap-1.5 font-medium ml-auto"
              >
                Amount{" "}
                <SortIcon
                  field="totalAmount"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </button>
            </TableHead>
            <TableHead className="w-[90px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="h-4 bg-muted rounded w-28" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-36" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-20" />
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-muted rounded w-10 mx-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-24 ml-auto" />
                </TableCell>
                <TableCell />
              </TableRow>
            ))
          ) : sales.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-16 text-center text-muted-foreground"
              >
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale: SaleListItem) => (
              <TableRow
                key={sale.id}
                className="group cursor-pointer"
                onClick={() => onView(sale.id)}
              >
                <TableCell>
                  <span className="font-mono text-sm font-medium text-primary">
                    {sale.invoiceNo}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm leading-tight">
                    {sale.customerName ?? sale.customer?.name ?? "Walk-in"}
                  </div>
                  {sale.customer?.town && (
                    <div className="text-xs text-muted-foreground">
                      {sale.customer.town}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {fmtDate(sale.saleDate)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {sale._count.lines}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  {fmt(Number(sale.totalAmount))}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onView(sale.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDelete(sale)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
