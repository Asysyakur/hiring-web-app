"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface SelectFieldProps {
  label?: string;
  name?: string;
  placeholder?: string;
  options: string[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  required?: boolean;
  search?: boolean;
  error?: string | undefined | null;
  className?: string;
}

export default function SelectField({
  label,
  name,
  placeholder = "Select option",
  options,
  value: controlledValue,
  defaultValue = null,
  onChange,
  required = false,
  search = false,
  error,
  className = "",
}: SelectFieldProps) {
  const [internalValue, setInternalValue] = useState<string | null>(
    controlledValue ?? defaultValue ?? null
  );

  useEffect(() => {
    if (controlledValue !== undefined) setInternalValue(controlledValue);
  }, [controlledValue]);

  const currentValue =
    controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = (v: string | null) => {
    if (controlledValue === undefined) {
      setInternalValue(v);
    }
    onChange?.(v);
  };

  const [query, setQuery] = useState("");
  const filtered =
    search && query
      ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
      : options;

  const inputId = name ?? undefined;
  const ariaDesc = error ? `${inputId}-error` : undefined;

  const baseWrapper = cn(
    "relative w-full rounded-md border bg-background text-sm transition-all",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
    error
      ? "border-destructive focus-within:ring-destructive"
      : "border-input hover:border-foreground/30",
    className
  );

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <Label htmlFor={inputId} className="mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {/* Hidden input for FormData compatibility */}
      <input type="hidden" name={name} value={currentValue ?? ""} />

      <div className={baseWrapper}>
        {search ? (
          // 🔍 Searchable (Combobox)
          <Combobox value={currentValue} onChange={(v) => setValue(v)}>
            <div className="relative">
              <div className="relative w-full cursor-default">
                <ComboboxInput
                  displayValue={(val: string | null) => val ?? ""}
                  placeholder={placeholder}
                  className={cn(
                    "w-full border-none bg-transparent py-2 pl-3 pr-10 text-sm text-foreground",
                    "focus-visible:outline-none"
                  )}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
                  aria-invalid={!!error}
                  aria-describedby={ariaDesc}
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </ComboboxButton>
              </div>

              <ComboboxOptions
                className={cn(
                  "absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md",
                  "bg-popover text-foreground shadow-md ring-1 ring-border"
                )}
                modal={false}
              >
                {filtered.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  filtered.map((opt) => (
                    <ComboboxOption
                      key={opt}
                      value={opt}
                      className={({ active }) =>
                        cn(
                          "relative cursor-pointer select-none py-2 pl-10 pr-4",
                          active ? "bg-accent text-accent-foreground" : ""
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={cn(
                              "block truncate",
                              selected ? "font-medium" : "font-normal"
                            )}
                          >
                            {opt}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </div>
          </Combobox>
        ) : (
          // 📋 Non-search (Listbox)
          <Listbox value={currentValue} onChange={(v) => setValue(v)}>
            <div className="relative">
              <ListboxButton
                className={cn(
                  "relative w-full cursor-default rounded-md bg-transparent py-2 pl-3 pr-10 text-left text-sm text-foreground focus-visible:outline-none"
                )}
                aria-invalid={!!error}
                aria-describedby={ariaDesc}
              >
                <span className="block truncate">
                  {currentValue ?? placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </span>
              </ListboxButton>

              <ListboxOptions
                className={cn(
                  "absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md",
                  "bg-popover text-foreground shadow-md ring-1 ring-border"
                )}
                modal={false}
              >
                {options.map((opt) => (
                  <ListboxOption
                    key={opt}
                    value={opt}
                    className={({ active }) =>
                      cn(
                        "relative cursor-pointer select-none py-2 pl-10 pr-4",
                        active ? "bg-accent text-accent-foreground" : ""
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn(
                            "block truncate",
                            selected ? "font-medium" : "font-normal"
                          )}
                        >
                          {opt}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        )}
      </div>

      {error && (
        <p id={ariaDesc} className="text-destructive text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
