import React from "react";

import { ArrowLeft, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/lib/types";
import { useRouter } from "next/navigation";

interface HeaderProps {
  supplier: Supplier;
  onExport: () => void;
}

function SupplierHeader({ supplier, onExport }: HeaderProps) {
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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {supplier.name}
          </h1>
          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <p>
              <span className="font-medium">GST:</span>{" "}
              {supplier.gstNumber || "N/A"}
            </p>
            <p>
              <span className="font-medium">Contact:</span>{" "}
              {supplier.contactName || "N/A"}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {supplier.phone || "N/A"}
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
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          onClick={onExport}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}

export default SupplierHeader;
