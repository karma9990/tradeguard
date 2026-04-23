import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl px-3 py-2 text-sm text-white transition-all outline-none appearance-none cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
