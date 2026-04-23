import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl px-3 py-2 text-sm text-white transition-all outline-none resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
