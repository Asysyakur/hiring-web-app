"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Country = {
  name: string;
  code: string;
  flag: string;
  dial: string;
};

const defaultCountries: Country[] = [
  { name: "Indonesia", code: "ID", flag: "🇮🇩", dial: "+62" },
  { name: "United States", code: "US", flag: "🇺🇸", dial: "+1" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dial: "+44" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dial: "+1" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dial: "+61" },
  { name: "Japan", code: "JP", flag: "🇯🇵", dial: "+81" },
];

export type PhoneInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  countries?: Country[];
  defaultCountryCode?: string;
  onCountryChange?: (country: Country) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  className?: string;
  error?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      countries = defaultCountries,
      defaultCountryCode,
      onCountryChange,
      label = "Phone number",
      required = false,
      placeholder = "81XXXXXXXXX",
      name,
      className,
      error,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const initialCountry =
      countries.find((c) => c.code === defaultCountryCode) ?? countries[0];
    const [selectedCountry, setSelectedCountry] = useState<Country>(
      initialCountry
    );
    const [internalPhone, setInternalPhone] = useState<string>(value ?? "");

    useEffect(() => {
      if (value !== undefined) {
        setInternalPhone(value);
      }
    }, [value]);

    useEffect(() => {
      const found = countries.find((c) => c.code === selectedCountry.code);
      if (!found) {
        setSelectedCountry(countries[0]);
        onCountryChange?.(countries[0]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countries]);

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      setOpen(false);
      onCountryChange?.(country);
    };

    const handleInputChange = (val: string) => {
      if (onChange) onChange(val);
      setInternalPhone(val);
    };

    const inputId = name ?? "phone";

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div
          className={cn(
            "flex rounded-md border bg-background text-sm transition-all",
            "focus-within:ring-2 focus-within:ring-offset-0",
            error
              ? "border-destructive focus-within:ring-destructive"
              : "border-input focus-within:ring-ring"
          )}
        >
          {/* Country selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-l-md border-r transition-colors",
                  "bg-background hover:bg-muted"
                )}
              >
                <span>{selectedCountry.flag}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[220px]">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.code}
                        onSelect={() => handleCountrySelect(country)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                        <span className="text-gray-500">{country.dial}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Number input */}
          <div className="flex items-center flex-1">
            <span className="px-2 text-gray-700">{selectedCountry.dial}</span>
            <input
              ref={ref}
              id={inputId}
              name={name}
              type="tel"
              className={cn(
                "flex-1 py-2 pr-3 text-sm outline-none border-none bg-transparent placeholder:text-gray-400",
                "focus:ring-0 focus-visible:ring-0"
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              placeholder={placeholder}
              value={internalPhone}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-destructive text-sm mt-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
