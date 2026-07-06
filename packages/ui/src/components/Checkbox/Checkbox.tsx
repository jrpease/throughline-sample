import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Checkbox — mirrors the Figma `Checkbox` component.
 * A presentational/controlled checkbox rendered as a <button role="checkbox">.
 * All colors/radius come from @ds/tokens via Tailwind theme vars.
 */
export interface CheckboxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Indeterminate state — shows a minus glyph when not checked. */
  indeterminate?: boolean;
  /** Disabled state — dims the box and blocks interaction. */
  disabled?: boolean;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, indeterminate, disabled, ...props }, ref) => {
    const active = checked || indeterminate;
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : !!checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className={cn(
          "h-5 w-5 rounded-sm border border-input inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)] shrink-0",
          !active && "hover:border-[var(--color-border-strong)]",
          active && "bg-primary border-transparent text-primary-foreground hover:bg-[var(--color-brand-primary-hover)]",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {checked ? (
          <Check size={14} aria-hidden />
        ) : indeterminate ? (
          <Minus size={14} aria-hidden />
        ) : null}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";
