"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
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

const mockProducts = [
  { id: 1, name: "Laptop", price: 45000, taxRate: 18 },
  { id: 2, name: "Mouse", price: 500, taxRate: 18 },
  { id: 3, name: "Keyboard", price: 1500, taxRate: 18 },
];

const mockCustomers = [
  { id: 1, name: "ABC Corporation" },
  { id: 2, name: "XYZ Enterprises" },
  { id: 3, name: "Tech Solutions Ltd" },
];

export default function NewSalePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    invoiceNo: "",
    customerId: "1",
    saleDate: "",
  });

  const [lines, setLines] = useState<SaleLine[]>([
    {
      productId: 1,
      productName: "Laptop",
      qty: 0,
      unitSellPrice: 45000,
      taxRate: 18,
      lineTotal: 0,
    },
  ]);

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        productId: 1,
        productName: "Laptop",
        qty: 0,
        unitSellPrice: 45000,
        taxRate: 18,
        lineTotal: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    if (field === "productId") {
      const product = mockProducts.find((p) => p.id === Number.parseInt(value));
      newLines[index] = {
        ...newLines[index],
        productId: Number.parseInt(value),
        productName: product?.name || "",
        unitSellPrice: product?.price || 0,
        taxRate: product?.taxRate || 0,
      };
    } else {
      newLines[index] = {
        ...newLines[index],
        [field]:
          field === "qty" || field === "unitSellPrice" || field === "taxRate"
            ? Number.parseFloat(value)
            : value,
      };
    }

    // Calculate line total
    const qty = newLines[index].qty;
    const price = newLines[index].unitSellPrice;
    const tax = newLines[index].taxRate;
    newLines[index].lineTotal = qty * price * (1 + tax / 100);

    setLines(newLines);
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => sum + line.lineTotal, 0);
  };

  const calculateSubtotal = () => {
    return lines.reduce((sum, line) => sum + line.qty * line.unitSellPrice, 0);
  };

  const calculateTotalTax = () => {
    return calculateTotal() - calculateSubtotal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the sale data
    console.log("[v0] New Sale:", {
      ...formData,
      lines,
      totalAmount: calculateTotal(),
    });
    router.push("/sales");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/sales")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Invoice</h1>
              <p className="text-muted-foreground">
                Generate a new sales invoice
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice">Invoice Number *</Label>
                    <Input
                      id="invoice"
                      placeholder="INV-S-2024-001"
                      value={formData.invoiceNo}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
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
                    <Label htmlFor="date">Sale Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) =>
                        setFormData({ ...formData, saleDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLine}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Tax %</TableHead>
                        <TableHead>Line Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={line.productId.toString()}
                              onValueChange={(value) =>
                                handleLineChange(index, "productId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id.toString()}
                                  >
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={line.qty}
                              onChange={(e) =>
                                handleLineChange(index, "qty", e.target.value)
                              }
                              className="w-24"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitSellPrice}
                              onChange={(e) =>
                                handleLineChange(
                                  index,
                                  "unitSellPrice",
                                  e.target.value
                                )
                              }
                              className="w-32"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={line.taxRate}
                              onChange={(e) =>
                                handleLineChange(
                                  index,
                                  "taxRate",
                                  e.target.value
                                )
                              }
                              className="w-20"
                              required
                            />
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{line.lineTotal.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {lines.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLine(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end mt-6">
                  <div className="space-y-2 w-80 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">
                        ₹{calculateSubtotal().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">
                        ₹{calculateTotalTax().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold text-lg">
                        Total Amount:
                      </span>
                      <span className="text-3xl font-bold">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/sales")}
              >
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
