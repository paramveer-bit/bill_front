import { SaleDetail, SalesLine } from "@/lib/types";
import { fmt, fmtDate } from "@/lib/helpers/functions";
function numberToWords(num: number): string {
  // Your existing implementation or a placeholder
  return "Amount in words placeholder";
}

interface InvoiceProps {
  invoiceData: SaleDetail;
  companyName: string;
}

export default function InvoiceTemplate({
  invoiceData,
  companyName,
}: InvoiceProps) {
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(v);

  return (
    <div
      className="invoice-box p-1 text-black"
      style={{ fontSize: "10px", fontFamily: "sans-serif" }}
    >
      <div className="border border-black h-full flex flex-col">
        {/* Header Section */}
        <div className="flex border-b border-black">
          <div className="p-1 font-bold text-xs border-r border-black w-24 flex items-center">
            INVOICE
          </div>
          <div className="flex-1 text-center p-1">
            <div className="font-bold text-base uppercase tracking-tight">
              {companyName}
            </div>
            <div className="text-[9px]">{invoiceData.customerName}</div>
          </div>
          <div className="p-1 font-bold text-xs border-l border-black w-24 flex items-center justify-end">
            Original
          </div>
        </div>

        {/* Invoice Info */}
        <div className="border-b border-black p-1 grid grid-cols-3 gap-2 text-[9px]">
          <div className="flex">
            <span className="font-bold w-16">Invoice No:</span>{" "}
            {invoiceData.invoiceNo}
          </div>
          <div className="flex">
            <span className="font-bold w-16">Date:</span>{" "}
            {fmtDate(invoiceData.saleDate)}
          </div>
          <div className="flex">
            <span className="font-bold w-16">Place:</span>{" "}
            {invoiceData.customerAddress}
          </div>
        </div>

        {/* Customer Details */}
        <div className="border-b border-black p-1 min-h-[30px]">
          <div className="font-bold text-[9px] uppercase mb-0.5">Bill To</div>
          <div className="font-bold text-[10px]">
            {invoiceData.customerName}
          </div>
          <div className="text-[9px]">{invoiceData.customerAddress}</div>
        </div>

        {/* Items Table */}
        <table className="w-full flex-1">
          <thead>
            <tr className="heading">
              <td className="w-6 border-r border-black text-center">Sr</td>
              <td className="border-r border-black flex-1">Description</td>
              <td className="w-12 border-r border-black text-center">Qty</td>
              <td className="w-14 border-r border-black text-center">Unit</td>
              <td className="w-16 border-r border-black text-right">Price</td>
              <td className="w-16 text-right">Amount</td>
            </tr>
          </thead>
          <tbody>
            {invoiceData.lines?.map((item: SalesLine, i: number) => (
              <tr key={i} className="item h-6">
                <td className="border-r border-black text-center text-[9px]">
                  {i + 1}
                </td>
                <td className="border-r border-black font-bold uppercase text-[9px]">
                  {item.productName}
                </td>
                <td className="border-r border-black text-center text-[9px]">
                  {item.unitQty}
                </td>
                <td className="border-r border-black text-center text-[9px]">
                  {item.unitname}
                </td>
                <td className="border-r border-black text-right text-[9px]">
                  {fmt(item.lineTotal / item.unitQty)}
                </td>
                <td className="text-right font-bold text-[9px]">
                  {fmt(item.lineTotal)}
                </td>
              </tr>
            ))}
            {[...Array(Math.max(0, 8 - (invoiceData.lines?.length || 0)))].map(
              (_, i) => (
                <tr key={`empty-${i}`} className="h-6">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="text-right"></td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {/* Footer Calculations */}
        <div className="flex border-t border-black">
          <div className="flex-1 p-1 border-r border-black text-[9px]">
            <div className="font-bold text-[9px]">Total in Words:</div>
            <div className="italic text-[8px]">
              Rupees {fmt(invoiceData.totalAmount)} Only
            </div>
          </div>

          <div className="w-44">
            <div className="flex justify-between p-1 border-b border-black text-[9px]">
              <span>Sub-Total</span>
              <span className="font-bold">{fmt(invoiceData.totalAmount)}</span>
            </div>
            <div className="flex justify-between p-1 border-b border-black text-[9px]">
              <span>Discount</span>
              <span className="font-bold">- {0}</span>
            </div>
            <div className="flex justify-between p-1 bg-zinc-100 font-bold text-[10px]">
              <span>Total</span>
              <span>{fmt(invoiceData.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
