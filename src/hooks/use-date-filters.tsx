import { useState, useMemo } from "react";
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  formatISO,
} from "date-fns";

export type DateFilterType =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "lastMonth"
  | "quarter"
  | "financialYear"
  | "custom"
  | "all";

export function useDateFilters(defaultFilter: DateFilterType = "month") {
  const [dateFilter, setDateFilter] = useState<DateFilterType>(defaultFilter);
  const [customRange, setCustomRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  const dateParams = useMemo(() => {
    const now = new Date();
    let sDate: Date | null = null;
    let eDate: Date | null = null;

    switch (dateFilter) {
      case "today":
        sDate = startOfToday();
        eDate = endOfToday();
        break;
      case "yesterday":
        sDate = startOfYesterday();
        eDate = endOfYesterday();
        break;
      case "week":
        sDate = startOfWeek(now, { weekStartsOn: 1 });
        eDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        sDate = startOfMonth(now);
        eDate = endOfMonth(now);
        break;
      case "lastMonth":
        const last = subMonths(now, 1);
        sDate = startOfMonth(last);
        eDate = endOfMonth(last);
        break;
      case "quarter":
        sDate = startOfQuarter(now);
        eDate = endOfQuarter(now);
        break;
      case "financialYear":
        const isAfterMarch = now.getMonth() >= 3;
        const startYear = isAfterMarch
          ? now.getFullYear()
          : now.getFullYear() - 1;
        sDate = new Date(startYear, 3, 1, 0, 0, 0);
        eDate = new Date(startYear + 1, 2, 31, 23, 59, 59);
        break;
      case "custom":
        if (customRange.start && customRange.end) {
          return {
            startDate: new Date(customRange.start).toISOString(),
            endDate: new Date(customRange.end).toISOString(),
          };
        }
        return null;
      default:
        return null; // "all" returns no params
    }

    if (sDate && eDate) {
      return {
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
      };
    }
    return null;
  }, [dateFilter, customRange]);

  return {
    dateFilter,
    setDateFilter,
    customRange,
    setCustomRange,
    dateParams, // Pass this directly to your axios 'params'
  };
}
