import { TableRow, TableCell } from "@/components/ui/table";
import { Calendar, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentRowProps {
  payment: any;
  onDelete: (sId: string, pId: string) => void;
  isDeleting: boolean;
}

export function PaymentRow({ payment, onDelete, isDeleting }: PaymentRowProps) {
  const getModeStyles = (mode: string) => {
    const map: any = {
      Cash: "bg-green-100 text-green-800",
      "Bank Transfer": "bg-blue-100 text-blue-800",
      UPI: "bg-orange-100 text-orange-800",
      Cheque: "bg-yellow-100 text-yellow-800",
    };
    return map[mode] || "bg-gray-100 text-gray-800";
  };

  return (
    <TableRow>
      <TableCell className="font-medium pl-4">
        {payment.supplier.name}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getModeStyles(payment.paymentMode)}`}
        >
          {payment.paymentMode}
        </span>
      </TableCell>
      <TableCell className="font-mono text-sm max-w-[120px] truncate">
        {payment.checkNo || payment.transactionId || payment.reference || "—"}
      </TableCell>
      <TableCell className="text-sm max-w-xs truncate">
        {payment.remarks || "—"}
      </TableCell>
      <TableCell className="text-right font-semibold">
        ₹{payment.amount.toLocaleString("en-IN")}
      </TableCell>
      <TableCell className="text-right pr-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(payment.supplierId, payment.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}
