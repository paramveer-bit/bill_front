import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LedgerEntry } from "@/lib/types";
import { fmt, fmtDate } from "@/lib/helpers/functions";

export function LedgerTable({
  entries,
  balanceBF,
  startDate,
}: {
  entries: LedgerEntry[];
  balanceBF: number;
  startDate?: string;
}) {
  return (
    <Table>
      <TableHeader className="bg-slate-900 text-white">
        <TableRow className="border-0 hover:bg-slate-900">
          <TableHead className="text-white font-semibold w-24">Date</TableHead>
          <TableHead className="text-white font-semibold">
            Description
          </TableHead>
          <TableHead className="text-right text-white font-semibold w-28">
            Debit
          </TableHead>
          <TableHead className="text-right text-white font-semibold w-28">
            Credit
          </TableHead>
          <TableHead className="text-right text-white font-semibold w-32">
            Balance
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-slate-50 border-0 hover:bg-slate-100">
          <TableCell className="font-medium text-slate-900">
            {startDate ? fmtDate(startDate) : "--"}
          </TableCell>
          <TableCell>
            <div className="text-sm font-semibold text-slate-900">
              Opening balance
            </div>
            <div className="text-xs text-slate-500">B/F from prior period</div>
          </TableCell>
          <TableCell className="text-right" />
          <TableCell className="text-right" />
          <TableCell className="text-right font-bold text-slate-900">
            {fmt(balanceBF)}
          </TableCell>
        </TableRow>
        {entries.map((entry) => (
          <TableRow
            key={entry.id}
            className="border-b border-slate-200 hover:bg-slate-50"
          >
            <TableCell className="text-slate-700 text-sm font-medium">
              {fmtDate(entry.date)}
            </TableCell>
            <TableCell>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${entry.type === "SALE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
              >
                {entry.type}
              </span>
              <div className="text-sm text-slate-900 font-medium mt-1">
                {entry.desc}
              </div>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {entry.debit > 0 ? (
                <span className="text-emerald-700 font-semibold">
                  {fmt(entry.debit)}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {entry.credit > 0 ? (
                <span className="text-blue-700 font-semibold">
                  {fmt(entry.credit)}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-slate-900">
              {fmt(entry.runningBalance)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
