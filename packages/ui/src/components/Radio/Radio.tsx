import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Radio — mirrors the Figma `Radio` component (the circular analog of Checkbox).
 * Use `RadioGroup` as a controlled wrapper that provides selection state via context;
 * each `Radio` reads that context to render its selected/unselected state.
 * All colors/radius come from @ds/tokens via Tailwind theme vars.
 */

interface RadioContextValue {
  value?: string;
  setValue: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioContext = React.createContext<RadioContextValue | null>(null);

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled selected value. */
  value?: string;
  /** Called with the value of the newly selected radio. */
  onValueChange?: (value: string) => void;
  /** Shared name applied to the group's radios. */
  name?: string;
  /** Disables the entire group. */
  disabled?: boolean;
  children?: React.ReactNode;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, disabled, children, ...props }, ref) => {
    const setValue = React.useCallback(
      (next: string) => {
        onValueChange?.(next);
      },
      [onValueChange]
    );

    const context = React.useMemo<RadioContextValue>(
      () => ({ value, setValue, name, disabled }),
      [value, setValue, name, disabled]
    );

    return (
      <RadioContext.Provider value={context}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** The value this radio represents within its group. */
  value: string;
  /** Disabled state — dims the control and blocks interaction. */
  disabled?: boolean;
  /** Label text rendered beside the control. Falls back to `children`. */
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ className, value, disabled, label, children, onClick, ...props }, ref) => {
    const context = React.useContext(RadioContext);
    const selected = context?.value === value;
    const isDisabled = disabled || context?.disabled || false;
    const content = label ?? children;

    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <button
          ref={ref}
          type="button"
          role="radio"
          name={context?.name}
          aria-checked={selected}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) {
              context?.setValue(value);
            }
          }}
          className={cn(
            "h-5 w-5 rounded-full border inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)] shrink-0",
            selected ? "border-primary border-2" : "border-input",
            isDisabled && "opacity-50 pointer-events-none",
            className
          )}
          {...props}
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          ) : null}
        </button>
        {content != null ? (
          <span
            className={cn(
              "text-foreground text-sm",
              isDisabled && "opacity-50 pointer-events-none"
            )}
          >
            {content}
          </span>
        ) : null}
      </label>
    );
  }
);
Radio.displayName = "Radio";
