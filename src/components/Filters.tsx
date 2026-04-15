"use client";

import { Search, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { filterOptions } from "@/components/DateFilterSelect";

interface DataTableFiltersProps {
  // Search state
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Date filter state
  dateFilter: string;
  onDateFilterChange: (value: string) => void;

  // Custom range state
  customRange: { start: string; end: string };
  onCustomRangeChange: (range: { start: string; end: string }) => void;

  // Actions
  onRefresh?: () => void;
}

export function DataTableFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  dateFilter,
  onDateFilterChange,
  customRange,
  onCustomRangeChange,
  onRefresh,
}: DataTableFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Select */}
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-full sm:w-[175px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Custom Range Inputs */}
      {dateFilter === "custom" && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/40 border animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <label className="text-xs text-muted-foreground shrink-0 w-7">
              From
            </label>
            <Input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, start: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <label className="text-xs text-muted-foreground shrink-0 w-7">
              To
            </label>
            <Input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, end: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
