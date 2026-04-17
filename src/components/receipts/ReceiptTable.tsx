import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Trash2 } from "lucide-react";
import { fmt, fmtDate } from "@/lib/helpers/functions";

export function ReceiptTable({
  receipts,
  isLoading,
  tableLoading,
  onDelete,
  isDeleting,
  deleteTarget,
}: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading receipts...
      </div>
    );
  }

  return (
    <div className="relative">
      {tableLoading && (
        <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-20 text-muted-foreground"
              >
                No receipts found
              </TableCell>
            </TableRow>
          ) : (
            receipts.map((receipt: any) => (
              <TableRow key={receipt.id} className="h-14">
                <TableCell className="pl-4 font-medium">
                  {receipt.customerName}
                </TableCell>
                <TableCell>{fmtDate(receipt.receiptDate)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted">
                    <CreditCard className="h-3 w-3" /> {receipt.paymentMode}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {receipt.remarks || "—"}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {fmt(receipt.amount)}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(receipt.id)}
                    disabled={isDeleting && deleteTarget === receipt.id}
                  >
                    {isDeleting && deleteTarget === receipt.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
