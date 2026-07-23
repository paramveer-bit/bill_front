"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  tableLoading: boolean;
}

export function AppPagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  tableLoading,
}: PaginationProps) {
  // Don't render anything if there is only one page or no items
  if (totalPages <= 1) return null;

  function getPageNumbers(): (number | "…")[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "…")[] = [1];

    if (page > 3) pages.push("…");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("…");

    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
      {/* "Showing X-Y of Z" logic */}
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {(page - 1) * pageSize + 1}
        </span>
        –
        <span className="font-medium text-foreground">
          {Math.min(page * pageSize, totalRecords)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {totalRecords.toLocaleString("en-IN")}
          {/* hi */}
        </span>
      </p>

      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1 || tableLoading}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1 || tableLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Number Pills */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, i) => (
            <Button
              key={i}
              variant={p === page ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 text-xs"
              disabled={tableLoading || p === "…"}
              onClick={() => typeof p === "number" && onPageChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        {/* Next Page Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page === totalPages || tableLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page === totalPages || tableLoading}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
