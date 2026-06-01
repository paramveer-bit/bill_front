"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Scale } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Category } from "@/lib/types";
import { ProductFormState, UnitRow } from "@/lib/types/forms";

interface ProductFormContentProps {
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
  categoryTree: Category[];
}

//
export function ProductFormContent({
  form,
  setForm,
  categoryTree,
}: ProductFormContentProps) {
  const addUnitRow = () => {
    setForm({
      ...form,
      unitRows: [
        ...form.unitRows,
        { unitName: "", conversionQty: "", sellingPrice: "" },
      ],
    });
  };

  const removeUnitRow = (index: number) => {
    setForm({
      ...form,
      unitRows: form.unitRows.filter((_, i) => i !== index),
    });
  };

  const updateUnitRow = (
    index: number,
    field: keyof UnitRow,
    value: string,
  ) => {
    const newRows = [...form.unitRows];
    newRows[index][field] = value;
    setForm({ ...form, unitRows: newRows });
  };

  return (
    <div className="space-y-6 py-2 max-h-[65vh] overflow-y-auto pr-2">
      {/* Identity Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">
            SKU / Barcode
          </Label>
          <Input
            placeholder="PRD001"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">
            Base Unit (e.g. Pcs) *
          </Label>
          <Input
            placeholder="Pcs"
            value={form.baseUnit}
            onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-slate-500">
          Product Name *
        </Label>
        <Input
          placeholder="Enter product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-slate-500">
          Category
        </Label>
        <Select
          value={form.categoryId}
          onValueChange={(v) => setForm({ ...form, categoryId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No Category</SelectItem>
            {categoryTree.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Unit Conversions Section */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <Label className="text-sm font-bold text-slate-700">
              Packaging Units
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUnitRow}
            className="h-7 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" /> Add Unit
          </Button>
        </div>

        {form.unitRows.map((row, index) => (
          <div
            key={index}
            className="flex items-end gap-2 animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] uppercase text-slate-400 font-bold">
                Unit Name
              </Label>
              <Input
                placeholder="Case / Box"
                value={row.unitName}
                onChange={(e) =>
                  updateUnitRow(index, "unitName", e.target.value)
                }
              />
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-[10px] uppercase text-slate-400 font-bold">
                Qty ({form.baseUnit || "Pcs"})
              </Label>
              <Input
                type="number"
                placeholder="24"
                value={row.conversionQty}
                onChange={(e) =>
                  updateUnitRow(index, "conversionQty", e.target.value)
                }
              />
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-[10px] uppercase text-slate-400 font-bold">
                Selling Price (₹)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={row.sellingPrice}
                onChange={(e) =>
                  updateUnitRow(index, "sellingPrice", e.target.value)
                }
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-10 w-10 hover:bg-destructive/10"
              onClick={() => removeUnitRow(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Pricing and Stock Toggle */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">
            Sell Price (₹)
          </Label>
          <Input
            type="number"
            value={form.currentSellPrice}
            onChange={(e) =>
              setForm({ ...form, currentSellPrice: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">
            GST %
          </Label>
          <Input
            type="number"
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border p-3 rounded-lg bg-white shadow-sm hover:border-primary/20 transition-colors">
        <div className="space-y-0.5">
          <Label className="font-bold">Inventory Tracking</Label>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Enable to track physical stock
          </p>
        </div>
        <Switch
          checked={form.isStockItem}
          onCheckedChange={(v) => setForm({ ...form, isStockItem: v })}
        />
      </div>
    </div>
  );
}
