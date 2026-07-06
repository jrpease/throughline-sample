import * as React from "react";
import { cn } from "../../lib/cn";

export interface TooltipProps {
  /** The tooltip text shown on hover/focus. */
  label: React.ReactNode;
  /** The trigger element. Should be focusable for keyboard accessibility. */
  children: React.ReactNode;
  /** Which side of the trigger the bubble appears on. Defaults to "top". */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional class names applied to the wrapper. */
  className?: string;
}

/**
 * Tooltip — mirrors the Figma `Tooltip` component (Placement axis: top/right/bottom/left).
 * A lightweight, CSS-driven hover/focus tooltip with no external positioning lib.
 * The bubble reveals on `group-hover` / `group-focus-within`, so the trigger
 * (`children`) must be focusable for keyboard users.
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  // bubble position relative to the trigger
  const bubblePos: Record<NonNullable<TooltipProps["side"]>, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };
  // arrow sits on the bubble edge nearest the trigger
  const arrowPos: Record<NonNullable<TooltipProps["side"]>, string> = {
    top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
    left: "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
    right: "right-full top-1/2 -translate-y-1/2 translate-x-1/2",
  };
  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "absolute z-50",
          "whitespace-nowrap rounded-md bg-[var(--color-bg-muted)] text-foreground text-sm font-medium px-2 py-1 shadow-md",
          "opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          bubblePos[side]
        )}
      >
        {label}
        <span
          aria-hidden
          className={cn(
            "absolute h-2 w-2 rotate-45 bg-[var(--color-bg-muted)]",
            arrowPos[side]
          )}
        />
      </span>
    </span>
  );
}
Tooltip.displayName = "Tooltip";
