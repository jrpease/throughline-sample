import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Avatar — mirrors the Figma `Avatar` component.
 * Circular container that shows an image when `src` is provided, otherwise
 * falls back to `initials`. An optional online `status` dot anchors to the
 * bottom-right. All colors/sizing/radius come from @ds/tokens via Tailwind.
 */
export const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-foreground font-medium",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-lg",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image URL. Maps to the Figma image fill slot. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Fallback initials shown when no `src` is provided. */
  initials?: string;
  /** When true, renders the online status dot. */
  status?: boolean;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, initials = "JP", status, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
        {status ? (
          <span
            aria-hidden
            className="absolute bottom-0 right-0 h-[28%] w-[28%] rounded-full bg-[var(--color-success-default)] ring-2 ring-[var(--color-bg-canvas)]"
          />
        ) : null}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
