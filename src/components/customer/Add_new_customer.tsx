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
import { Customer } from "@/lib/types";
import { showErrorToast } from "@/lib/helpers/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Add_new_customerProps {
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  customerToEdit?: Customer | null;
  customers: Customer[];
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function Add_new_customer({
  setCustomers,
  customerToEdit,
  customers,
  isDialogOpen,
  setIsDialogOpen,
}: Add_new_customerProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    town: "",
    balance: 0,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
      town: "",
      balance: 0,
    });
  };

  useEffect(() => {
    console.log("customerToEdit changed:", customerToEdit);
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name,
        phone: customerToEdit.phone,
        email: customerToEdit.email,
        gstNumber: customerToEdit.gstNumber,
        address: customerToEdit.address,
        town: customerToEdit.town,
        balance: customerToEdit.balance,
      });
    } else {
      resetForm();
    }
  }, [!customerToEdit]);

  const handleSubmit = async () => {
    try {
      if (customerToEdit) {
        // UPDATE LOGIC
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_BASEURL}/customer/${customerToEdit.id}`,
          formData,
        );
        const updated = res.data.data;
        setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        // CREATE LOGIC
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BASEURL}/customer`,
          formData,
        );
        setCustomers([...customers, res.data.data]);
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
            {customerToEdit ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
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
          {!customerToEdit && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor="balance">Opening Balance</Label>
              <Input
                id="balance"
                type="number"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Initial balance for this customer account.
              </p>
            </div>
          )}
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
          <div className="space-y-2 col-span-2">
            <Label htmlFor="town">Town</Label>
            <Textarea
              id="town"
              placeholder="Enter Town"
              value={formData.town}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  town: e.target.value,
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
            {customerToEdit ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Add_new_customer;
