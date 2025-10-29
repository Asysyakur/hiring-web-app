import React, { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string | undefined;
  labelClassName?: string;
  wrapperClassName?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      id,
      name,
      required,
      rows = 4,
      className = "",
      labelClassName = "block text-sm font-medium mb-1",
      wrapperClassName = "flex flex-col gap-2",
      leftAddon,
      rightAddon,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? name ?? undefined;

    return (
      <div className={wrapperClassName}>
        {label && (
          <Label htmlFor={inputId} className={labelClassName}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}

        <div
          className={cn(
            "relative w-full rounded-md border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-all",
            error ? "border-destructive focus-within:ring-destructive" : "", className
          )}
        >
          <div className="flex items-start">
            {leftAddon && (
              <div className="mr-2 flex items-start">{leftAddon}</div>
            )}

            <ShadcnTextarea
              id={inputId}
              name={name}
              ref={ref}
              rows={rows}
              className={cn(
                "border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 text-sm",
                leftAddon && "pl-0",
                rightAddon && "pr-0",
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              {...props}
            />

            {rightAddon && (
              <div className="ml-2 flex items-start">{rightAddon}</div>
            )}
          </div>
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

TextArea.displayName = "TextArea";

export default TextArea;
