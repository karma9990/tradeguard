import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl px-3 py-2 text-sm text-white transition-all outline-none",
        "placeholder:text-white/25",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.09)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.12)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
