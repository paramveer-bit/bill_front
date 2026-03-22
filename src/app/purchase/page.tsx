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
import { Plus, Search, Eye, Trash2, Calendar } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PurchaseBatch = {
  productId: number;
  productName: string;
  qtyReceived: number;
  unitCost: number;
};

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  invoiceNo: string;
  purchaseDate: string;
  totalAmount: number;
  batches: PurchaseBatch[];
};

export default function PurchasePage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 1,
      supplierId: 1,
      supplierName: "Tech Supplies Co.",
      invoiceNo: "INV-2024-001",
      purchaseDate: "2024-01-15",
      totalAmount: 95000,
      batches: [
        {
          productId: 1,
          productName: "Laptop",
          qtyReceived: 2,
          unitCost: 42000,
        },
        { productId: 2, productName: "Mouse", qtyReceived: 10, unitCost: 450 },
      ],
    },
    {
      id: 2,
      supplierId: 2,
      supplierName: "Global Electronics",
      invoiceNo: "INV-2024-002",
      purchaseDate: "2024-01-20",
      totalAmount: 24000,
      batches: [
        {
          productId: 3,
          productName: "Keyboard",
          qtyReceived: 20,
          unitCost: 1200,
        },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (dateFilter === "all") return true;

    const purchaseDate = new Date(purchase.purchaseDate);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateFilter) {
      case "1day":
        return now.getTime() - purchaseDate.getTime() <= dayInMs;
      case "week":
        return now.getTime() - purchaseDate.getTime() <= 7 * dayInMs;
      case "month":
        return (
          purchaseDate.getMonth() === now.getMonth() &&
          purchaseDate.getFullYear() === now.getFullYear()
        );
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const purchaseQuarter = Math.floor(purchaseDate.getMonth() / 3);
        return (
          purchaseQuarter === currentQuarter &&
          purchaseDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  });

  const handleDeletePurchase = (id: number) => {
    setPurchases(purchases.filter((p) => p.id !== id));
  };

  const openViewDialog = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setIsViewDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Purchase Orders</h1>
              <p className="text-muted-foreground">
                Track your inventory purchases
              </p>
            </div>
            <Button onClick={() => router.push("/purchase/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Purchase
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by supplier or invoice number..."
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
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.invoiceNo}
                      </TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(purchase.purchaseDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{purchase.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {purchase.batches.length} items
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(purchase)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePurchase(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No purchases found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Purchase Details</DialogTitle>
              </DialogHeader>
              {viewingPurchase && (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Supplier Name
                      </p>
                      <p className="font-semibold">
                        {viewingPurchase.supplierName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Invoice Number
                      </p>
                      <p className="font-semibold">
                        {viewingPurchase.invoiceNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Purchase Date
                      </p>
                      <p className="font-semibold">
                        {new Date(
                          viewingPurchase.purchaseDate
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Purchase Items</h3>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right">
                              Unit Cost
                            </TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingPurchase.batches.map((batch, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {batch.productName}
                              </TableCell>
                              <TableCell className="text-right">
                                {batch.qtyReceived}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{batch.unitCost.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹
                                {(
                                  batch.qtyReceived * batch.unitCost
                                ).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-right font-semibold"
                            >
                              Total Amount
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              ₹{viewingPurchase.totalAmount.toLocaleString()}
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
