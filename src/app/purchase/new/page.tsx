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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type PurchaseBatch = {
  productId: number;
  productName: string;
  qtyReceived: number;
  unitCost: number;
  sellingPrice: number;
  mrp: number;
};

type Supplier = {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
};

const mockProducts = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Mouse" },
  { id: 3, name: "Keyboard" },
];

const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Tech Supplies Co.",
    contactName: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "contact@techsupplies.com",
    gstNumber: "29ABCDE1234F1Z5",
    address: "123 Tech Street, Bangalore",
  },
  {
    id: 2,
    name: "Global Electronics",
    contactName: "Priya Sharma",
    phone: "+91 98765 43211",
    email: "info@globalelec.com",
    gstNumber: "27ABCDE5678G2Z6",
    address: "456 Electronics Avenue, Mumbai",
  },
];

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceNo: "",
    purchaseDate: "",
  });

  const [batches, setBatches] = useState<PurchaseBatch[]>([
    {
      productId: 1,
      productName: "Laptop",
      qtyReceived: 0,
      unitCost: 0,
      sellingPrice: 0,
      mrp: 0,
    },
  ]);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
  });

  const handleAddBatch = () => {
    setBatches([
      ...batches,
      {
        productId: 1,
        productName: "Laptop",
        qtyReceived: 0,
        unitCost: 0,
        sellingPrice: 0,
        mrp: 0,
      },
    ]);
  };

  const handleRemoveBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const handleBatchChange = (index: number, field: string, value: any) => {
    const newBatches = [...batches];
    if (field === "productId") {
      const product = mockProducts.find((p) => p.id === Number.parseInt(value));
      newBatches[index] = {
        ...newBatches[index],
        productId: Number.parseInt(value),
        productName: product?.name || "",
      };
    } else {
      newBatches[index] = {
        ...newBatches[index],
        [field]:
          field === "qtyReceived" ||
          field === "unitCost" ||
          field === "sellingPrice" ||
          field === "mrp"
            ? Number.parseFloat(value)
            : value,
      };
    }
    setBatches(newBatches);
  };

  const calculateTotal = () => {
    return batches.reduce(
      (sum, batch) => sum + batch.qtyReceived * batch.unitCost,
      0
    );
  };

  const handleAddSupplier = () => {
    const newSupplier: Supplier = {
      id: suppliers.length + 1,
      ...supplierFormData,
    };
    setSuppliers([...suppliers, newSupplier]);
    setFormData({ ...formData, supplierId: newSupplier.id.toString() });
    setIsAddSupplierOpen(false);
    setSupplierFormData({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[v0] New Purchase:", {
      ...formData,
      batches,
      totalAmount: calculateTotal(),
    });
    router.push("/purchase");
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
              onClick={() => router.push("/purchase")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add New Purchase</h1>
              <p className="text-muted-foreground">
                Create a new purchase order
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Purchase Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.supplierId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, supplierId: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog
                        open={isAddSupplierOpen}
                        onOpenChange={setIsAddSupplierOpen}
                      >
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add New Supplier</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="supplier-name">
                                  Supplier Name *
                                </Label>
                                <Input
                                  id="supplier-name"
                                  placeholder="Enter supplier name"
                                  value={supplierFormData.name}
                                  onChange={(e) =>
                                    setSupplierFormData({
                                      ...supplierFormData,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplier-contact">
                                  Contact Person
                                </Label>
                                <Input
                                  id="supplier-contact"
                                  placeholder="Enter contact name"
                                  value={supplierFormData.contactName}
                                  onChange={(e) =>
                                    setSupplierFormData({
                                      ...supplierFormData,
                                      contactName: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="supplier-phone">
                                  Phone Number
                                </Label>
                                <Input
                                  id="supplier-phone"
                                  placeholder="+91 XXXXX XXXXX"
                                  value={supplierFormData.phone}
                                  onChange={(e) =>
                                    setSupplierFormData({
                                      ...supplierFormData,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplier-email">Email</Label>
                                <Input
                                  id="supplier-email"
                                  type="email"
                                  placeholder="supplier@example.com"
                                  value={supplierFormData.email}
                                  onChange={(e) =>
                                    setSupplierFormData({
                                      ...supplierFormData,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="supplier-gst">GST Number</Label>
                              <Input
                                id="supplier-gst"
                                placeholder="29ABCDE1234F1Z5"
                                value={supplierFormData.gstNumber}
                                onChange={(e) =>
                                  setSupplierFormData({
                                    ...supplierFormData,
                                    gstNumber: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="supplier-address">Address</Label>
                              <Input
                                id="supplier-address"
                                placeholder="Enter full address"
                                value={supplierFormData.address}
                                onChange={(e) =>
                                  setSupplierFormData({
                                    ...supplierFormData,
                                    address: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddSupplierOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="button" onClick={handleAddSupplier}>
                              Add Supplier
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice">Invoice Number *</Label>
                    <Input
                      id="invoice"
                      placeholder="INV-2024-001"
                      value={formData.invoiceNo}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Purchase Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
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
                  <CardTitle>Purchase Items</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBatch}
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
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Selling Price</TableHead>
                        <TableHead>MRP</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={batch.productId.toString()}
                              onValueChange={(value) =>
                                handleBatchChange(index, "productId", value)
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
                              value={batch.qtyReceived}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "qtyReceived",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={batch.unitCost}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "unitCost",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Selling Price"
                              value={batch.sellingPrice}
                              onChange={(e) =>
                                handleBatchChange(
                                  index,
                                  "sellingPrice",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="MRP"
                              value={batch.mrp}
                              onChange={(e) =>
                                handleBatchChange(index, "mrp", e.target.value)
                              }
                              required
                            />
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹
                            {(
                              batch.qtyReceived * batch.unitCost
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {batches.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBatch(index)}
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
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold">
                      ₹{calculateTotal().toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/purchase")}
              >
                Cancel
              </Button>
              <Button type="submit">Save Purchase</Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
