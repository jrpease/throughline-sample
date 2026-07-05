import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * SelectMenu — mirrors the Figma `Select Menu` (shadcn `SelectContent`).
 * The popover surface that holds a list of `SelectMenuItem`s, opened from a
 * Select trigger. Composable: items are passed as `children` (the Figma slot's
 * code expression). All colors/radius come from @ds/tokens via CSS vars; the
 * Figma "Elevation/2" effect style is a style (not a synced variable), so the
 * shadow uses Tailwind's `shadow-md` — matching how `Card` handles elevation.
 */
export interface SelectMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectMenu = React.forwardRef<HTMLDivElement, SelectMenuProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={cn(
        "flex flex-col gap-0.5 rounded-md border p-1 shadow-md",
        "border-[var(--color-border-subtle)] bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SelectMenu.displayName = "SelectMenu";

/**
 * SelectMenuItem — mirrors the Figma `Select Menu Item` (shadcn `SelectItem`).
 * One selectable row. The Figma `State` axis maps to code as:
 *   Default  → base styles
 *   Hover    → :hover           (bg-subtle)
 *   Focused  → :focus-visible   (bg-muted + border-focus ring)
 *   Selected → `selected` prop  (bg-subtle + trailing check, brand-primary)
 *   Disabled → `disabled` prop  (text-disabled, not interactive)
 * The label is passed as `children`. The check icon is internal (lucide
 * `Check`), shown only when selected — not a swappable slot.
 */
export interface SelectMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Marks the item as the current selection — shows the trailing check. */
  selected?: boolean;
  /** Disables interaction and dims the item. */
  disabled?: boolean;
}

export const SelectMenuItem = React.forwardRef<
  HTMLDivElement,
  SelectMenuItemProps
>(({ className, selected, disabled, children, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    aria-selected={selected}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : 0}
    data-selected={selected ? "" : undefined}
    data-disabled={disabled ? "" : undefined}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors",
      "text-[var(--color-text-primary)]",
      "hover:bg-[var(--color-bg-subtle)]",
      "focus-visible:bg-[var(--color-bg-muted)] focus-visible:ring-1 focus-visible:ring-[var(--color-border-focus)]",
      selected && "bg-[var(--color-bg-subtle)]",
      disabled && "pointer-events-none text-[var(--color-text-disabled)]",
      className
    )}
    {...props}
  >
    <span className="flex-1 truncate">{children}</span>
    {selected && (
      <Check
        size={16}
        aria-hidden
        className="ml-auto shrink-0 text-[var(--color-brand-primary)]"
      />
    )}
  </div>
));
SelectMenuItem.displayName = "SelectMenuItem";
