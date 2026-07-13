import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Select — mirrors the Figma `Select` trigger.
 * An accessible styled wrapper around a native <select>. The root is a
 * relative inline-flex container so a non-interactive ChevronDown can sit
 * absolutely on the right while the native <select> handles all behavior.
 * All colors/spacing/radius come from @ds/tokens via Tailwind theme vars.
 */
export const selectVariants = cva(
  "appearance-none w-full rounded-md border bg-[var(--color-bg-subtle)] text-foreground outline-none transition-colors disabled:cursor-not-allowed",
  {
    variants: {
      // Right padding reserves clearance for the absolutely-positioned
      // ChevronDown. Left/right are set explicitly (not `px-*`) so nothing
      // overrides the chevron clearance when cva/twMerge compose classes.
      size: {
        sm: "h-9 pl-3 pr-8 text-sm",
        md: "h-10 pl-3 pr-9 text-base",
        lg: "h-11 pl-4 pr-10 text-lg",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  /** Error state — uses destructive border/ring instead of the default. */
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "md", error, disabled, children, ...props }, ref) => {
    const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;
    return (
      <div className="relative inline-flex w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            selectVariants({ size }),
            error
              ? "border-destructive focus-visible:[box-shadow:var(--shadow-focus-danger)]"
              : "border-input focus-visible:[box-shadow:var(--shadow-focus)]",
            disabled && "opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={iconSize}
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "lg" ? "right-4" : "right-3"
          )}
        />
      </div>
    );
  }
);
Select.displayName = "Select";
