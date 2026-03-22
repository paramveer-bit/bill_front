"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Eye, Trash2, Calendar, User } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SaleLine = {
  productId: number;
  productName: string;
  qty: number;
  unitSellPrice: number;
  taxRate: number;
  lineTotal: number;
};

type Sale = {
  id: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  lines: SaleLine[];
};

const mockProducts = [
  { id: 1, name: "Laptop", price: 45000, taxRate: 18 },
  { id: 2, name: "Mouse", price: 500, taxRate: 18 },
  { id: 3, name: "Keyboard", price: 1200, taxRate: 18 },
];

const mockCustomers = [
  { id: 1, name: "ABC Corporation" },
  { id: 2, name: "XYZ Enterprises" },
];

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 1,
      invoiceNo: "INV-S-2024-001",
      customerId: 1,
      customerName: "ABC Corporation",
      saleDate: "2024-01-15",
      totalAmount: 106200,
      lines: [
        {
          productId: 1,
          productName: "Laptop",
          qty: 2,
          unitSellPrice: 45000,
          taxRate: 18,
          lineTotal: 106200,
        },
      ],
    },
    {
      id: 2,
      invoiceNo: "INV-S-2024-002",
      customerId: 2,
      customerName: "XYZ Enterprises",
      saleDate: "2024-01-18",
      totalAmount: 5900,
      lines: [
        {
          productId: 2,
          productName: "Mouse",
          qty: 10,
          unitSellPrice: 500,
          taxRate: 18,
          lineTotal: 5900,
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "all") return true;

    const saleDate = new Date(sale.saleDate);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case "1day":
        return now.getTime() - saleDate.getTime() <= dayInMs;
      case "week":
        return now.getTime() - saleDate.getTime() <= 7 * dayInMs;
      case "month":
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const saleQuarter = Math.floor(saleDate.getMonth() / 3);
        return (
          saleQuarter === currentQuarter &&
          saleDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });

  const handleDeleteSale = (id: number) => {
    setSales(sales.filter((s) => s.id !== id));
  };

  const openViewDialog = (sale: Sale) => {
    setViewingSale(sale);
    setIsViewDialogOpen(true);
  };

  const calculateSubtotal = (lines: SaleLine[]) => {
    return lines.reduce((sum, line) => sum + line.qty * line.unitSellPrice, 0);
  };

  const calculateTotalTax = (lines: SaleLine[]) => {
    const subtotal = calculateSubtotal(lines);
    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    return total - subtotal;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sales & Invoices</h1>
              <p className="text-muted-foreground">
                Manage your sales transactions
              </p>
            </div>
            <Button onClick={() => router.push("/sales/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.invoiceNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {sale.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(sale.saleDate).toLocaleDateString("en-IN")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{sale.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sale.lines.length} items
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSale(sale.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No sales found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
              </DialogHeader>
              {viewingSale && (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Invoice Number
                      </p>
                      <p className="font-semibold">{viewingSale.invoiceNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-semibold">
                        {viewingSale.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Date</p>
                      <p className="font-semibold">
                        {new Date(viewingSale.saleDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Invoice Items</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right">
                              Unit Price
                            </TableHead>
                            <TableHead className="text-right">Tax %</TableHead>
                            <TableHead className="text-right">
                              Line Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingSale.lines.map((line, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {line.productName}
                              </TableCell>
                              <TableCell className="text-right">
                                {line.qty}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{line.unitSellPrice.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {line.taxRate}%
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{line.lineTotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right">
                              Subtotal
                            </TableCell>
                            <TableCell className="text-right">
                              ₹
                              {calculateSubtotal(
                                viewingSale.lines
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} className="text-right">
                              Tax
                            </TableCell>
                            <TableCell className="text-right">
                              ₹
                              {calculateTotalTax(
                                viewingSale.lines
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-right font-semibold"
                            >
                              Total Amount
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              ₹{viewingSale.totalAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
