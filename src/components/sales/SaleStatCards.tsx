import { ReceiptText, TrendingUp, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/helpers/functions";
import { Summary } from "@/lib/types";

function fmtCompact(amount: number) {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)}Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return fmt(amount);
}

function StatCard({ label, amount, count, icon: Icon, accent }: any) {
  return (
    <div className="relative rounded-xl border bg-card overflow-hidden p-5 transition-all hover:shadow-md">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", accent)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums leading-tight">
            {fmtCompact(amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{count} invoices</p>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-lg shrink-0",
            accent.replace("bg-", "bg-").replace("-500", "-100"),
          )}
        >
          <Icon className={cn("h-4 w-4", accent.replace("bg-", "text-"))} />
        </div>
      </div>
    </div>
  );
}

export function SaleStatCards({ summary }: { summary: Summary | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Today"
        amount={summary?.today.amount ?? 0}
        count={summary?.today.count ?? 0}
        icon={ReceiptText}
        accent="bg-blue-500"
      />
      <StatCard
        label="This Month"
        amount={summary?.month.amount ?? 0}
        count={summary?.month.count ?? 0}
        icon={TrendingUp}
        accent="bg-emerald-500"
      />
      <StatCard
        label="All Time"
        amount={summary?.allTime.amount ?? 0}
        count={summary?.allTime.count ?? 0}
        icon={ShoppingBag}
        accent="bg-violet-500"
      />
    </div>
  );
}
