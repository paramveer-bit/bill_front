"use client";

import { Input } from "@/components/ui/input";

interface SalePriceInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function SalePriceInput({
  value,
  onChange,
  disabled = false,
}: SalePriceInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        ₹
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-5 h-8 text-sm w-full"
      />
    </div>
  );
}
