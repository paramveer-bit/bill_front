"use client";

import { useState } from "react";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Calendar, CreditCard } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Receipt = {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  paymentMode: string;
  receiptDate: string;
  reference: string;
};

const mockCustomers = [
  { id: 1, name: "ABC Electronics" },
  { id: 2, name: "Tech Solutions Ltd" },
];

const paymentModes = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI",
  "Net Banking",
  "Cheque",
];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: 1,
      customerId: 1,
      customerName: "ABC Electronics",
      amount: 50000,
      paymentMode: "Net Banking",
      receiptDate: "2024-01-17",
      reference: "TXN123456789",
    },
    {
      id: 2,
      customerId: 2,
      customerName: "Tech Solutions Ltd",
      amount: 25000,
      paymentMode: "UPI",
      receiptDate: "2024-01-18",
      reference: "UPI/424242424",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "1",
    amount: "",
    paymentMode: "Cash",
    receiptDate: "",
    reference: "",
  });

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.paymentMode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "all") return true;

    const receiptDate = new Date(receipt.receiptDate);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case "1day":
        return now.getTime() - receiptDate.getTime() <= dayInMs;
      case "week":
        return now.getTime() - receiptDate.getTime() <= 7 * dayInMs;
      case "month":
        return (
          receiptDate.getMonth() === now.getMonth() &&
          receiptDate.getFullYear() === now.getFullYear()
        );
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const receiptQuarter = Math.floor(receiptDate.getMonth() / 3);
        return (
          receiptQuarter === currentQuarter &&
          receiptDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });

  const handleAddReceipt = () => {
    const customer = mockCustomers.find(
      (c) => c.id === Number.parseInt(formData.customerId)
    );
    const newReceipt: Receipt = {
      id: receipts.length + 1,
      customerId: Number.parseInt(formData.customerId),
      customerName: customer?.name || "",
      amount: Number.parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      receiptDate: formData.receiptDate,
      reference: formData.reference,
    };
    setReceipts([...receipts, newReceipt]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDeleteReceipt = (id: number) => {
    setReceipts(receipts.filter((r) => r.id !== id));
  };

  const resetForm = () => {
    setFormData({
      customerId: "1",
      amount: "",
      paymentMode: "Cash",
      receiptDate: "",
      reference: "",
    });
  };

  const getTotalAmount = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  };

  const getPaymentModeColor = (mode: string) => {
    const colors: { [key: string]: string } = {
      Cash: "bg-green-100 text-green-800",
      "Credit Card": "bg-blue-100 text-blue-800",
      "Debit Card": "bg-purple-100 text-purple-800",
      UPI: "bg-orange-100 text-orange-800",
      "Net Banking": "bg-cyan-100 text-cyan-800",
      Cheque: "bg-yellow-100 text-yellow-800",
    };
    return colors[mode] || "bg-gray-100 text-gray-800";
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payment Receipts</h1>
              <p className="text-muted-foreground">
                Track customer payments and receipts
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Payment Receipt</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, customerId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">Payment Mode</Label>
                    <Select
                      value={formData.paymentMode}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paymentMode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Receipt Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.receiptDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiptDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference/Transaction ID</Label>
                    <Input
                      id="reference"
                      placeholder="Enter transaction reference"
                      value={formData.reference}
                      onChange={(e) =>
                        setFormData({ ...formData, reference: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddReceipt}>Add Receipt</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <p className="text-sm text-muted-foreground">Total Receipts</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{receipts.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <p className="text-sm text-muted-foreground">
                  Total Amount Received
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹{getTotalAmount().toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <p className="text-sm text-muted-foreground">This Month</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ₹
                  {receipts
                    .filter((r) => {
                      const date = new Date(r.receiptDate);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    })
                    .reduce((sum, r) => sum + r.amount, 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer, reference, or payment mode..."
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Receipt Date</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {receipt.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(receipt.receiptDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentModeColor(
                            receipt.paymentMode
                          )}`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {receipt.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {receipt.reference}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{receipt.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReceipt(receipt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No receipts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
