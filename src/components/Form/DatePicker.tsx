"use client";

import * as React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  name?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  error?: string;
}

export function DatePicker({
  name,
  value,
  onChange,
  label = "Date of birth",
  id = "date",
  placeholder = "Select date",
  className = "",
  labelClassName = "",
  required,
  error,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalDate(value);
    }
  }, [value]);

  const selected = value ?? internalDate;

  const handleSelect = (date?: Date) => {
    if (onChange) onChange(date);
    if (value === undefined) setInternalDate(date);
    setOpen(false);
  };

  const inputId = id ?? "date";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Label */}
      {label && (
        <Label
          htmlFor={inputId}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      {/* Hidden input supaya formData bisa baca nilainya */}
      <input
        type="hidden"
        name={name}
        value={selected ? selected.toISOString() : ""}
      />

      {/* Popover (button input) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            variant="outline"
            className={cn(
              "w-full justify-between items-center text-sm rounded-md border bg-background transition-all",
              "hover:bg-muted focus-visible:ring-2 focus-visible:ring-offset-0",
              error
                ? "border-destructive focus-visible:ring-destructive"
                : "border-input focus-visible:ring-ring",
              "pl-3 pr-2 font-normal text-gray-700"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-700" />
              {selected ? (
                selected.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-0 mt-1 w-auto rounded-md shadow-lg border border-gray-200"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            captionLayout="dropdown"
            className="rounded-md"
          />
        </PopoverContent>
      </Popover>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="text-destructive text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default DatePicker;
