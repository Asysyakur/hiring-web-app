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

/**
 * SelectField (Headless UI)
 * - search=true -> Combobox (searchable)
 * - search=false -> Listbox (classic select)
 * - shows error border + message
 * - renders hidden input for form compatibility (FormData)
 */
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
  // internal state so component works uncontrolled if parent doesn't pass value/onChange
  const [internalValue, setInternalValue] = useState<string | null>(
    controlledValue ?? defaultValue ?? null
  );

  // keep internal in sync when controlledValue changes
  useEffect(() => {
    if (controlledValue !== undefined) setInternalValue(controlledValue);
  }, [controlledValue]);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = (v: string | null) => {
    if (controlledValue === undefined) {
      setInternalValue(v);
    }
    onChange?.(v);
  };

  // filter for combobox
  const [query, setQuery] = useState("");
  const filtered =
    search && query
      ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
      : options;

  const inputId = name ?? undefined;
  const ariaDesc = error ? `${inputId}-error` : undefined;

  // wrapper border classes (error / normal)
  const wrapperBorder = error ? "border-2 border-danger" : "border-2 border-gray-200";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1 text-gray-700">
          {label} {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {/* Hidden input so <form> + FormData sees the value */}
      <input type="hidden" name={name} value={currentValue ?? ""} />

      <div className={`relative ${wrapperBorder} rounded-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30`}>
        {search ? (
          // Combobox (searchable)
          <Combobox value={currentValue} onChange={(v) => setValue(v)}>
            <div className="relative">
              <div className="relative w-full cursor-default">
                <ComboboxInput
                  displayValue={(val: string | null) => val ?? ""}
                  placeholder={placeholder}
                  className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-800 rounded-md focus:outline-none"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={ariaDesc}
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-auto">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </ComboboxButton>
              </div>

              <ComboboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
                {filtered.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">No results found.</div>
                ) : (
                  filtered.map((opt) => (
                    <ComboboxOption
                      key={opt}
                      value={opt}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? "bg-primary/10 text-primary" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{opt}</span>
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
          // Listbox (non-search)
          <Listbox value={currentValue} onChange={(v) => setValue(v)}>
            <div className="relative">
              <ListboxButton
                className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-800 focus:outline-none"
                aria-invalid={!!error}
                aria-describedby={ariaDesc}
              >
                <span className="block truncate">{currentValue ?? placeholder}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </span>
              </ListboxButton>

              <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
                {options.map((opt) => (
                  <ListboxOption
                    key={opt}
                    value={opt}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{opt}</span>
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
        <p id={ariaDesc} className="text-danger text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
