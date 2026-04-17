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
import { format, parseISO } from "date-fns";
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
    <Table className="print:text-[11px]">
      <TableHeader className="bg-slate-900 text-white print:text[11px]">
        <TableRow className="border-0 hover:bg-slate-900">
          <TableHead className="text-white font-semibold w-28 pl-4">
            Date
          </TableHead>
          <TableHead className="text-white font-semibold w-24">Type</TableHead>
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
          <TableHead className="text-right text-white font-semibold w-32 pr-5">
            Remarks
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/*------------------------- Opening Balance Row ----------------------------------*/}
        <TableRow className="bg-slate-50 border-0 hover:bg-slate-100">
          <TableCell className="font-medium text-slate-900 pl-3">
            {startDate ? format(parseISO(startDate), "dd'-'MM'-'yy") : "--"}
          </TableCell>
          <TableCell className="text-right" />
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
          <TableCell className="text-right pr-5" />
        </TableRow>

        {entries.map((entry) => (
          <TableRow
            key={entry.id}
            className="border-b border-slate-200 hover:bg-slate-50 print:text-[11px]"
          >
            <TableCell className="text-slate-700 text-sm font-medium pl-3 print:text-[11px]">
              {format(parseISO(entry.date), "dd'-'MM'-'yy")}
            </TableCell>
            <TableCell>{entry.type}</TableCell>
            <TableCell>
              <div className="text-sm text-slate-900 font-medium mt-1 print:text-[11px]">
                {entry.desc}
              </div>
            </TableCell>
            <TableCell className="text-right font-mono text-sm print:text-[11px]">
              {entry.debit > 0 ? (
                <span className="text-emerald-700 font-semibold print:text-[11px]">
                  {fmt(entry.debit)}
                </span>
              ) : (
                ""
              )}
            </TableCell>
            <TableCell className="text-right font-mono text-sm print:text-[11px]">
              {entry.credit > 0 ? (
                <span className="text-blue-700 font-semibold print:text-[11px]">
                  {fmt(entry.credit)}
                </span>
              ) : (
                ""
              )}
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-slate-900 print:text-[11px]">
              {fmt(entry.runningBalance)}
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-slate-900 pr-5 print:text-[11px]">
              {entry.remarks}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
