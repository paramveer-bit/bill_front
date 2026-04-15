"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  town: string;
  balance: number;
};

interface CustomerComboboxProps {
  customers: Customer[];
  value: string;
  onChange: (v: string) => void;
}

export function CustomerCombobox({
  customers,
  value,
  onChange,
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = customers.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10 px-3"
        >
          {selected ? (
            <div className="flex flex-col items-start min-w-0 text-left">
              <span className="text-sm font-medium truncate">
                {selected.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {selected.town}
                {selected.balance !== 0 && (
                  <span
                    className={
                      selected.balance > 0
                        ? " text-amber-600"
                        : " text-green-600"
                    }
                  >
                    {selected.balance > 0
                      ? ` · Due ₹${selected.balance.toLocaleString()}`
                      : ` · Adv ₹${Math.abs(selected.balance).toLocaleString()}`}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              Select customer…
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search by name, phone, or town…"
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.phone ?? ""} ${c.town}`}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 shrink-0",
                      value === c.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium text-sm">
                      {c.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{c.town}</span>
                      {c.phone && <span>{c.phone}</span>}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
