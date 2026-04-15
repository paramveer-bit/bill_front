"use client";

import { ArrowLeft, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/types";
import { useRouter } from "next/navigation";

interface HeaderProps {
  customer: Customer;
  onExport: () => void;
}

export function CustomerHeader({ customer, onExport }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 print:hidden">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mt-1 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {customer.name}
          </h1>
          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <p>
              <span className="font-medium">GST:</span> {customer.gstNumber}
            </p>
            <p>
              <span className="font-medium">Location:</span> {customer.town}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button
          onClick={onExport}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
    </div>
  );
}
