import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Input — mirrors the Figma `Input` component.
 * The root wrapper is an inline-flex container so an optional leading icon can
 * sit inside alongside the actual <input>, which fills the remaining space.
 * Focus is handled on the wrapper via focus-within since the icon is a sibling.
 * All colors/spacing/radius come from @ds/tokens via Tailwind theme vars.
 */
export const inputVariants = cva(
  "inline-flex w-full items-center rounded-md border bg-[var(--color-bg-subtle)] text-foreground outline-none transition-colors",
  {
    variants: {
      size: {
        sm: "h-9 gap-2 px-3 text-sm",
        md: "h-10 gap-2 px-3 text-base",
        lg: "h-11 gap-3 px-4 text-lg",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Error state — uses destructive border/ring instead of the default. */
  error?: boolean;
  /** Optional leading icon (any lucide-react icon). Maps to the Figma `leadingIcon` slot. */
  leadingIcon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", error, leadingIcon: Leading, disabled, ...props }, ref) => {
    const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;
    return (
      <div
        className={cn(
          inputVariants({ size }),
          error
            ? "border-destructive focus-within:[box-shadow:var(--shadow-focus-danger)]"
            : "border-input focus-within:[box-shadow:var(--shadow-focus)]",
          disabled && "opacity-50",
          className
        )}
      >
        {Leading ? (
          <Leading size={iconSize} className="shrink-0 text-muted-foreground" aria-hidden />
        ) : null}
        <input
          ref={ref}
          disabled={disabled}
          className="flex-1 border-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
