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
  value?: Date;
  onChange?: (date?: Date) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label = "Date of birth",
  id = "date",
  placeholder = "Select date",
  className = "",
  labelClassName = "",
  required,
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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}{" "}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-between items-center text-sm rounded-md border border-input bg-background",
              "hover:bg-muted focus:ring-2 focus:ring-primary focus:ring-offset-0",
              "font-normal text-gray-700",
              "pl-3 pr-2"
            )}
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
    </div>
  );
}

export default DatePicker;
