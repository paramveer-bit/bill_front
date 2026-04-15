"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { fmt } from "@/lib/helpers/functions";
import { format } from "date-fns";

interface MetricsProps {
  totalDebit: number;
  totalCredit: number;
  balance: number;
  startDate?: string;
  endDate?: string;
}

export function LedgerMetrics({
  totalDebit,
  totalCredit,
  balance,
  startDate,
  endDate,
}: MetricsProps) {
  const isDebit = balance > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Period"
        icon={<CalendarIcon className="h-4 w-4 text-slate-400" />}
        value={
          startDate
            ? `${format(new Date(startDate), "dd MMM")} — ${format(new Date(endDate || new Date()), "dd MMM yyyy")}`
            : "All Time"
        }
      />
      <MetricCard
        title="Sales"
        icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
        value={fmt(totalDebit)}
        className="bg-emerald-50 text-emerald-700"
      />
      <MetricCard
        title="Payments"
        icon={<TrendingDown className="h-4 w-4 text-blue-600" />}
        value={fmt(totalCredit)}
        className="bg-blue-50 text-blue-700"
      />
      <MetricCard
        title="Balance"
        icon={<Wallet className="h-4 w-4 text-slate-600" />}
        value={fmt(Math.abs(balance))}
        className={
          isDebit ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }
      />
    </div>
  );
}

function MetricCard({ title, icon, value, className = "" }: any) {
  return (
    <Card className={`border-0 shadow-sm transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase opacity-80">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
