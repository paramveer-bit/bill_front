import { forwardRef } from "react";
import InvoiceTemplate from "@/components/templates/Invoice";
import { SaleDetail } from "@/lib/types";
interface BatchInvoicePrinterProps {
  invoices: SaleDetail[];
  companyName: string;
}
export const BatchInvoicePrinter = forwardRef(
  ({ invoices, companyName }: BatchInvoicePrinterProps, ref: any) => {
    return (
      <div ref={ref} className="hidden print:block">
        <style>{`
        @media print {
          .page-break { 
            page-break-after: always; 
            break-after: page;
          }
          @page { size: A5; margin: 5mm; }
        }
      `}</style>

        {invoices.map((invoice: any, index: number) => (
          <div key={invoice.id || index} className="page-break">
            {/* Reusing your existing InvoiceTemplate */}
            <InvoiceTemplate invoiceData={invoice} companyName={companyName} />
          </div>
        ))}
      </div>
    );
  },
);

BatchInvoicePrinter.displayName = "BatchInvoicePrinter";
