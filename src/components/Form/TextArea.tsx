import React, { forwardRef } from "react";

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
      ...props
    },
    ref
  ) => {
    const inputId = id ?? name ?? undefined;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className={labelClassName}>
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}

        <div
          className={`relative w-full cursor-default border-2 rounded-md ${
            error ? "border-destructive" : "border-gray-200"
          }`}
        >
          <div className="flex items-start">
            <textarea
              id={inputId}
              name={name}
              ref={ref}
              rows={rows}
              className={`w-full border-none text-sm text-gray-800 rounded-md focus:outline-2 focus:outline-primary resize-y p-2 focus:outline-none ${className}`}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              {...props}
            />
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
