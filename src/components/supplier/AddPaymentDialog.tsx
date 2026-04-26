"use client";

import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { Plus, Loader2 } from "lucide-react";

// UI Components
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helpers & Types
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toast";
import { useApi } from "@/hooks/useApi";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

const paymentModes = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Credit Note",
  "Other",
];

interface AddPaymentProps {
  fetchPayments: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddPaymentDialog({
  fetchPayments,
  isDialogOpen,
  setIsDialogOpen,
}: AddPaymentProps) {
  const [formData, setFormData] = useState({
    supplierId: "",
    amount: "",
    paymentMode: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    remarks: "",
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const api = useApi();
  const fetchSuppliers = useCallback(async () => {
    setIsLoadingSuppliers(true);
    try {
      const res = await api.get(`${BASE}/suppliers`);
      setSuppliers(res.data.data.data || []);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to load suppliers",
      );
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      fetchSuppliers();
    }
  }, [isDialogOpen, fetchSuppliers]);

  const resetForm = () => {
    setFormData({
      supplierId: "",
      amount: "",
      paymentMode: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      reference: "",
      remarks: "",
    });
  };

  const handleAddPayment = async () => {
    if (
      !formData.supplierId ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    ) {
      showErrorToast("Please select a supplier and enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      reference: formData.reference || null,
      remarks: formData.remarks || null,
      paymentDate: new Date(formData.paymentDate).toISOString(),
    };

    try {
      // Endpoint logic: /supplier/:id/payment
      await api.post(`/supplier-payments/`, {
        ...payload,
        supplierId: formData.supplierId,
      });
      fetchPayments();
      showSuccessToast("Payment recorded successfully!");
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.message || "Failed to record payment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </DialogTrigger> */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Supplier Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select
              value={formData.supplierId}
              onValueChange={(v) => setFormData({ ...formData, supplierId: v })}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingSuppliers ? "Loading..." : "Select supplier"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            {/* Date */}
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Payment Mode */}
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

          {/* Reference */}
          <div className="space-y-2">
            <Label>Reference</Label>
            <Input
              placeholder="Cheque No / Transaction ID"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
            />
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Optional notes..."
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
          <Button onClick={handleAddPayment} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
