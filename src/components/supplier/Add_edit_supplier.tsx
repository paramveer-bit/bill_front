import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Supplier } from "@/lib/types";
import { showErrorToast } from "@/lib/helpers/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Add_edit_supplierProps {
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  supplierToEdit?: Supplier | null;
  suppliers: Supplier[];
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function Add_edit_supplier({
  setSuppliers,
  supplierToEdit,
  suppliers,
  isDialogOpen,
  setIsDialogOpen,
}: Add_edit_supplierProps) {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    openingBalance: 0,
    balance: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
      openingBalance: 0,
      balance: 0,
    });
  };

  useEffect(() => {
    console.log("supplierToEdit changed:", supplierToEdit);
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name,
        contactName: supplierToEdit.contactName,
        phone: supplierToEdit.phone,
        email: supplierToEdit.email,
        gstNumber: supplierToEdit.gstNumber,
        address: supplierToEdit.address,
        openingBalance: Number(supplierToEdit.openingBalance),
        balance: Number(supplierToEdit.balance),
      });
    } else {
      resetForm();
    }
  }, [!supplierToEdit]); // Only depend on ID to avoid unnecessary resets

  const handleSubmit = async () => {
    console.log("Submitting form with data:", formData);
    try {
      if (supplierToEdit) {
        // UPDATE LOGIC
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_BASEURL}/supplier/${supplierToEdit.id}`,
          formData,
        );
        const updated = res.data.data;
        setSuppliers(suppliers.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        // CREATE LOGIC
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BASEURL}/supplier`,
          formData,
        );
        setSuppliers([...suppliers, res.data.data]);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.errors?.[0]?.message || "Operation failed",
      );
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {supplierToEdit ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Supplier Name */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              placeholder="Enter supplier name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="town">Contact Name</Label>
            <Input
              id="contactName"
              placeholder="Enter contact name"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactName: e.target.value,
                })
              }
            />
          </div>
          {/* Phone and Email */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          {/* GST Number */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="gst">GST Number</Label>
            <Input
              id="gst"
              placeholder="27AABCU9603R1ZM"
              value={formData.gstNumber}
              onChange={(e) =>
                setFormData({ ...formData, gstNumber: e.target.value })
              }
            />
          </div>

          {/* Opening Balance */}
          {!supplierToEdit && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input
                id="openingBalance"
                type="number"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingBalance: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Initial balance for this customer account.
              </p>
            </div>
          )}
          {/* Address */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="address">Billing Address</Label>
            <Textarea
              id="address"
              placeholder="Enter billing address"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {supplierToEdit ? "Save Changes" : "Add Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Add_edit_supplier;
