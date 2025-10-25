"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input as ShadcnInput } from "@/components/ui/input"; // base input shadcn

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      name,
      required,
      className,
      labelClassName,
      wrapperClassName,
      leftAddon,
      rightAddon,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? name ?? undefined;

    return (
      <div className={cn("flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className={cn("text-sm font-medium", labelClassName)}
          >
            {label}{" "}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}

        <div
          className={cn(
            "flex items-center rounded-md border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-all",
            error ? "border-destructive focus-within:ring-destructive" : "", className
          )}
        >
          {leftAddon && (
            <span className="px-3 text-sm text-muted-foreground">
              {leftAddon}
            </span>
          )}

          <ShadcnInput
            id={inputId}
            name={name}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              "border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1",
              leftAddon && "pl-0",
              rightAddon && "pr-0",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <span className="px-3 text-sm text-muted-foreground">
              {rightAddon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-destructive text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
