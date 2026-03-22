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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, Calendar, TrendingUp } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

type SupplierPayment = {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  reference: string;
};

const mockSuppliers = [
  { id: 1, name: "Tech Supplies Co." },
  { id: 2, name: "Global Electronics" },
];

export default function SupplierPaymentsPage() {
  const [payments, setPayments] = useState<SupplierPayment[]>([
    {
      id: 1,
      supplierId: 1,
      supplierName: "Tech Supplies Co.",
      amount: 50000,
      paymentMode: "Bank Transfer",
      paymentDate: "2024-01-15",
      reference: "TXN123456789",
    },
    {
      id: 2,
      supplierId: 2,
      supplierName: "Global Electronics",
      amount: 25000,
      paymentMode: "UPI",
      paymentDate: "2024-01-20",
      reference: "UPI987654321",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "",
    amount: "",
    paymentMode: "Bank Transfer",
    paymentDate: "",
    reference: "",
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "all") return true;

    const paymentDate = new Date(payment.paymentDate);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case "1day":
        return now.getTime() - paymentDate.getTime() <= dayInMs;
      case "week":
        return now.getTime() - paymentDate.getTime() <= 7 * dayInMs;
      case "month":
        return (
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getFullYear() === now.getFullYear()
        );
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const paymentQuarter = Math.floor(paymentDate.getMonth() / 3);
        return (
          paymentQuarter === currentQuarter &&
          paymentDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });

  const handleAddPayment = () => {
    const supplier = mockSuppliers.find(
      (s) => s.id === Number.parseInt(formData.supplierId)
    );
    const newPayment: SupplierPayment = {
      id: payments.length + 1,
      supplierId: Number.parseInt(formData.supplierId),
      supplierName: supplier?.name || "",
      amount: Number.parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      paymentDate: formData.paymentDate,
      reference: formData.reference,
    };
    setPayments([...payments, newPayment]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      amount: "",
      paymentMode: "Bank Transfer",
      paymentDate: "",
      reference: "",
    });
  };

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const thisMonthPayments = payments
    .filter((p) => new Date(p.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Supplier Payments</h1>
              <p className="text-muted-foreground">
                Track payments to your suppliers
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Supplier Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, supplierId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSuppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.id}
                            value={supplier.id.toString()}
                          >
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
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
                    <Label htmlFor="mode">Payment Mode *</Label>
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
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Payment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Transaction Reference</Label>
                    <Input
                      id="reference"
                      placeholder="Transaction ID, Cheque No, etc."
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
                  <Button onClick={handleAddPayment}>Record Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Total Payments</div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{totalPayments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">This Month</div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{thisMonthPayments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
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
                    placeholder="Search by supplier or reference..."
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
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.supplierName}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {payment.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.reference || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No payments found
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
