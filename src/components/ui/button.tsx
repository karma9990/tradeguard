"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 shrink-0 whitespace-nowrap select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        ghost: "",
        destructive: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-xs": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: "linear-gradient(135deg, rgba(52,211,153,0.9), rgba(16,185,129,0.9))",
    boxShadow: "0 0 20px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
    border: "1px solid rgba(52,211,153,0.3)",
    color: "#fff",
  },
  outline: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid transparent",
    color: "rgba(255,255,255,0.6)",
  },
  destructive: {
    background: "rgba(248,113,113,0.15)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "#f87171",
  },
  link: {
    background: "transparent",
    border: "none",
    color: "#34d399",
  },
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      loading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? (Slot.Root as React.ElementType) : "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ ...variantStyles[variant ?? "default"], ...style }}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
