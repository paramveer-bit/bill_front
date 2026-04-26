import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Category, Product } from "@/lib/types";
import { showErrorToast } from "@/lib/helpers/toast";
import { ProductFormContent } from "./ProductFormContent";
import { ProductFormState } from "@/lib/types/forms";
import { useApi } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

const defaultForm: ProductFormState = {
  sku: "",
  name: "",
  baseUnit: "Pcs",
  currentSellPrice: "",
  taxRate: "18",
  isStockItem: true,
  categoryId: "0",
  unitRows: [],
};

interface AddEditProductProps {
  //   setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  editingProduct?: Product | null;
  categoryTree: Category[]; // Assuming this is the correct type for categoryTree
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const buildPayload = (f: ProductFormState) => ({
  ...f,
  currentSellPrice: parseFloat(f.currentSellPrice) || 0,
  taxRate: parseFloat(f.taxRate) || 0,
  categoryId: f.categoryId === "0" ? null : f.categoryId,
  // Converting form strings to integer numbers for API
  unitConversions: f.unitRows.map((u) => ({
    unitName: u.unitName,
    conversionQty: parseInt(u.conversionQty) || 1,
  })),
});

function AddEditProduct({
  //   setCustomers,
  editingProduct,
  categoryTree,
  isDialogOpen,
  setIsDialogOpen,
}: AddEditProductProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const api = useApi();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        // UPDATE LOGIC
        const res = await api.put(
          `/products/${editingProduct.id}`,
          buildPayload(form),
        );
        const updated = res.data.data;
      } else {
        // CREATE LOGIC
        const res = await api.post(`/products`, buildPayload(form));
      }
      setIsDialogOpen(false);
      setForm(defaultForm);
    } catch (err) {
      const error = err as AxiosError<any>;
      showErrorToast(
        error.response?.data?.errors?.[0]?.message || "Operation failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setForm({
        sku: editingProduct.sku,
        name: editingProduct.name,
        baseUnit: editingProduct.baseUnit,
        currentSellPrice: editingProduct.currentSellPrice.toString(),
        taxRate: editingProduct.taxRate
          ? editingProduct.taxRate.toString()
          : "0",
        isStockItem: editingProduct.isStockItem,
        categoryId: editingProduct.categoryId || "0",
        unitRows:
          editingProduct.unitConversions
            ?.filter((uc) => uc.unitName !== editingProduct.baseUnit)
            .map((uc) => ({
              unitName: uc.unitName,
              conversionQty: uc.conversionQty.toString(),
            })) || [],
      });
    } else {
      setForm(defaultForm);
    }
  }, [!editingProduct]);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Register New Product"}
          </DialogTitle>
        </DialogHeader>
        <ProductFormContent
          form={form}
          setForm={setForm}
          categoryTree={categoryTree}
        />
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : editingProduct ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddEditProduct;
