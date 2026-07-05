import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Textarea — mirrors the Figma `Textarea` component.
 * The multi-line sibling of Input: a styled native <textarea> that fills its
 * container, grows vertically (resize-y), and shares the same token-driven
 * border/ring/background treatment as Input.
 * All colors/spacing/radius come from @ds/tokens via Tailwind theme vars.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state — uses destructive border/ring instead of the default. */
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[88px] rounded-md border bg-[var(--color-bg-subtle)] px-3 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-y disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-destructive focus-visible:[box-shadow:var(--shadow-focus-danger)]"
            : "border-input focus-visible:[box-shadow:var(--shadow-focus)]",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
