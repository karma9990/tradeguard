"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none",
        className
      )}
      style={{
        background: checked
          ? "linear-gradient(135deg, rgba(52,211,153,0.9), rgba(16,185,129,0.8))"
          : "rgba(255,255,255,0.12)",
      }}
      {...props}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  )
);
Switch.displayName = "Switch";

export { Switch };
