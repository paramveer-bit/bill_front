import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SummaryProps {
  totalAmount: number;
  count: number;
  thisMonthAmount: number;
  dateFilter: string; // NEW: to display the range
  startDate?: Date; // NEW: for custom date range
  endDate?: Date; // NEW: for custom date range
}

export function PaymentSummary({
  totalAmount,
  count,
  thisMonthAmount,
  dateFilter,
  startDate,
  endDate,
}: SummaryProps) {
  const formatINR = (val: number) =>
    val.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // CHANGE #1: Get the date range label based on filter
  const getDateRangeLabel = (): string => {
    const today = new Date();

    switch (dateFilter) {
      case "all":
        return "All Time";
      case "1day":
        return "Last 24 Hours";
      case "week":
        return `Last 7 Days (${new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")} - ${today.toLocaleDateString("en-IN")})`;
      case "month":
        return `This Month (${today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })})`;
      case "previous-month": {
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        return prevMonth.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
      }
      case "quarter": {
        const quarter = Math.floor(today.getMonth() / 3) + 1;
        return `Q${quarter} ${today.getFullYear()}`;
      }
      case "custom":
        if (startDate && endDate) {
          return `${startDate.toLocaleDateString("en-IN")} - ${endDate.toLocaleDateString("en-IN")}`;
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  // CHANGE #2: Show the currently displayed amount (totalAmount is already filtered)
  return (
    <div className="space-y-2 mb-4">
      {/* CHANGE #3: Add a label showing the current date range */}
      <div className="text-sm text-muted-foreground">
        Showing data for:{" "}
        <span className="font-semibold">{getDateRangeLabel()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Total Payments
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(totalAmount)}</p>
            {/* CHANGE #4: Add a subtle note about the range */}
            <p className="text-xs text-muted-foreground mt-2">
              {dateFilter === "all"
                ? "Lifetime total"
                : `For ${getDateRangeLabel().toLowerCase()}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Transaction Count
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {count === 1 ? "payment" : "payments"} recorded
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              {/* CHANGE #5: Dynamic card title based on filter */}
              {dateFilter === "month"
                ? "This Month"
                : dateFilter === "previous-month"
                  ? "Previous Month"
                  : dateFilter === "quarter"
                    ? "This Quarter"
                    : "Period Total"}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(thisMonthAmount)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {dateFilter === "all"
                ? "Select a date range to see period details"
                : `For selected range`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
