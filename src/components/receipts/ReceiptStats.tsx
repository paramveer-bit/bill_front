import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fmt } from "@/lib/helpers/functions";

export function ReceiptStats({ totalCount, totalAmount, dateFilter }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3 text-sm text-muted-foreground">
          Total Receipts
        </CardHeader>
        <CardContent className="text-2xl font-bold">{totalCount}</CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3 text-sm text-muted-foreground">
          Amount In Period
        </CardHeader>
        <CardContent className="text-2xl font-bold text-emerald-600">
          {fmt(totalAmount)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3 text-sm text-muted-foreground">
          Selected Filter
        </CardHeader>
        <CardContent className="text-2xl font-bold capitalize">
          {dateFilter.replace(/([A-Z])/g, " $1")}
        </CardContent>
      </Card>
    </div>
  );
}
