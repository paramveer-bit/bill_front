import { Input } from "@/components/ui/input";

interface PriceInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function PriceInput({
  value,
  onChange,
  placeholder = "0.00",
}: PriceInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        ₹
      </span>
      <Input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-5 h-8 text-sm w-full"
      />
    </div>
  );
}
