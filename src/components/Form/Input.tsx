import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | undefined;
  labelClassName?: string;
  wrapperClassName?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      name,
      required,
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

    // class untuk input padding tergantung addon
    const inputPaddingClass = leftAddon ? "pl-2" : "pl-3";
    const inputPaddingRightClass = rightAddon ? "pr-2" : "pr-3";

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className={labelClassName}>
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}

       <div
          className={`relative w-full cursor-default border-2 rounded-md ${
            error ? "border-danger" : "border-gray-200"
          }`}
        >
          <div className="flex items-center">

          {/* Left addon (contoh: Rp) */}
          {leftAddon && (
            <span
            aria-hidden="true"
            className="inline-flex items-center px-3 text-sm text-gray-700 select-none rounded-l-md"
            >
              {leftAddon}
            </span>
          )}

          <input
            id={inputId}
            name={name}
            ref={ref}
            className={`w-full border-none py-2 pl-3 pr-2 text-sm text-gray-800 rounded-md focus:outline-2 focus:outline-primary ${inputPaddingClass} ${inputPaddingRightClass} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
            />

          {/* Right addon (opsional) */}
          {rightAddon && (
            <span
            aria-hidden="true"
            className="inline-flex items-center px-3 text-sm text-gray-700 select-none rounded-r-md"
            >
              {rightAddon}
            </span>
          )}
          </div>
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-danger text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
