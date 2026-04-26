import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
import { Customer } from "@/lib/types";
import axios, { AxiosError } from "axios";
import { useApi } from "@/hooks/useApi";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

const paymentModes = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI",
  "Net Banking",
  "Cheque",
  "Discount",
];

interface Add_new_props {
  fetchReceipts: any;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function New_edit({
  fetchReceipts,
  isDialogOpen,
  setIsDialogOpen,
}: Add_new_props) {
  const [formData, setFormData] = useState({
    customerId: "",
    amount: "",
    paymentMode: "Cash",
    receiptDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const api = useApi();
  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const res = await api.get(`/customers`);
      setCustomers(res.data.data.data || []);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to load customers",
      );
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const resetForm = () => {
    setFormData({
      customerId: "",
      amount: "",
      paymentMode: "Cash",
      receiptDate: new Date().toISOString().split("T")[0],
      remarks: "",
    });
  };

  const handleAddReceipt = async () => {
    if (
      !formData.customerId ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    ) {
      showErrorToast("Please check customer selection and amount");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      remarks: formData.remarks || null,
      receiptDate: new Date(formData.receiptDate).toISOString(),
    };
    try {
      console.log("Submitting new receipt with payload:", payload);
      const res = await api.post(`${BASE}/receipts`, payload);
      fetchReceipts();
      showSuccessToast("Receipt created successfully!");
      setIsDialogOpen(false);
    } catch (err) {
      const error = err as AxiosError<any>;

      showErrorToast(error.response?.data?.message || "Failed to Add Receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Receipt
        </Button>
      </DialogTrigger> */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={formData.customerId}
              onValueChange={(v) => setFormData({ ...formData, customerId: v })}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingCustomers ? "Loading..." : "Select customer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select
              value={formData.paymentMode}
              onValueChange={(v) =>
                setFormData({ ...formData, paymentMode: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Receipt Date</Label>
            <Input
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
            <Label>Remarks</Label>
            <Input
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddReceipt} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}{" "}
            Add Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default New_edit;
