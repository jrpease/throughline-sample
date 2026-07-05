import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Button — mirrors the Figma `Button` component set.
 * Variants (shadcn vocabulary) and sizes map 1:1 to the Figma variant matrix;
 * all colors/spacing/radius come from @ds/tokens via Tailwind theme vars.
 */
export const buttonVariants = cva(
  // Focus ring reads --btn-focus (fallback: --shadow-focus). Solid-filled variants (default, destructive)
  // override it below with the neutral on-fill ring so it stays visible on a colored fill. Each variant
  // sets --btn-focus at most once, so there's no cascade race.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--btn-focus,var(--shadow-focus))] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--color-brand-primary-hover)] [--btn-focus:var(--shadow-focus-on-fill)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90 [--btn-focus:var(--shadow-focus-on-fill)]",
        outline: "border border-input bg-transparent text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        link: "bg-transparent text-[var(--color-text-link)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-11 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional leading icon (any lucide-react icon). Maps to the Figma `leadingIcon` slot. */
  leadingIcon?: LucideIcon;
  /** Optional trailing icon. Maps to the Figma `trailingIcon` slot. */
  trailingIcon?: LucideIcon;
  /** Loading state — shows a spinner and disables the button. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, leadingIcon: Leading, trailingIcon: Trailing, loading, disabled, children, ...props },
    ref
  ) => {
    const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={iconSize} aria-hidden />
        ) : Leading ? (
          <Leading size={iconSize} aria-hidden />
        ) : null}
        {children}
        {!loading && Trailing ? <Trailing size={iconSize} aria-hidden /> : null}
      </button>
    );
  }
);
Button.displayName = "Button";
