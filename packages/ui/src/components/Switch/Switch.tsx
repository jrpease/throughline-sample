import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Switch — mirrors the Figma `Switch` component.
 * A toggle rendered as a <button role="switch">; colors come from @ds/tokens
 * via Tailwind theme vars, with an adaptive thumb (bg.canvas) whose >=3:1 edge is carried by a border/strong outline.
 */
export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the switch is on. Maps to the Figma `checked` state. */
  checked?: boolean;
  /** Disables the switch. */
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full px-0.5 transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
          checked ? "bg-primary" : "bg-muted",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-canvas)] shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
