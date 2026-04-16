// "use client";

// import { useRef } from "react";
// import { useReactToPrint } from "react-to-print";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Printer, X } from "lucide-react";
// import InvoiceTemplate from "@/components/templates/Invoice";
// interface InvoicePrintDialogProps {
//   open: boolean;
//   onClose: () => void;
//   invoiceData: any;
//   companyName: string;
//   companyLogo?: string;
// }

// export function InvoicePrintDialog({
//   open,
//   onClose,
//   invoiceData,
//   companyName,
//   companyLogo,
// }: InvoicePrintDialogProps) {
//   const contentRef = useRef<HTMLDivElement>(null);

//   const handlePrint = useReactToPrint({
//     contentRef,
//     documentTitle: `Invoice_${invoiceData?.invoiceNo || "Draft"}`,
//     preserveAfterPrint: true,
//   });

//   if (!invoiceData) return null;

//   const items = invoiceData.lineItems || [];
//   const subtotal = items.reduce(
//     (sum: number, item: any) => sum + item.quantity * item.unitPrice,
//     0,
//   );
//   // Total is now just Subtotal - Discount
//   const total = subtotal - (invoiceData.discount || 0);

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 border-none">
//         <DialogHeader className="sticky top-0 bg-white border-b px-6 py-4 flex flex-row items-center justify-between z-50">
//           <DialogTitle>Invoice Preview</DialogTitle>
//           <div className="flex gap-2">
//             <Button size="sm" onClick={() => handlePrint()} className="gap-2">
//               <Printer className="w-4 h-4" />
//               Print Invoice
//             </Button>
//             <Button size="sm" variant="ghost" onClick={onClose}>
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className="bg-zinc-100 p-4 md:p-6 flex justify-center">
//           <div
//             ref={contentRef}
//             className="bg-white shadow-xl print:shadow-none w-full max-w-[210mm] h-[148.5mm]"
//           >
//             <style
//               dangerouslySetInnerHTML={{
//                 __html: `
//               @media print {
//                 @page { size: A5; margin: 5mm; }
//                 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//                 .no-print { display: none !important; }
//               }
//               .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
//               .invoice-box table td { padding: 4px; vertical-align: top; }
//               .invoice-box table tr.heading td { background: #eee; border: 1px solid #000; font-weight: bold; }
//               .invoice-box table tr.item td { border: 1px solid #000; }
//             `,
//               }}
//             />

//             <InvoiceTemplate
//               invoiceData={invoiceData}
//               companyName={companyName}
//             />
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
