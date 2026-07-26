import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Console controls. Machined faces with a hard edge, letterspaced console
 * caps, and a press that physically sinks. Amber is the live actuator; the
 * rest are unlit plate.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-unit border font-console text-label font-semibold uppercase tracking-console whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5",
  {
    variants: {
      variant: {
        // The lit actuator.
        default:
          "border-amber/70 bg-amber text-[#17110A] shadow-raise hover:bg-[#FFBE55] hover:border-amber active:translate-y-px active:shadow-well",
        // Unlit machined plate.
        outline:
          "border-amber/25 bg-panel-3 text-bone shadow-raise hover:bg-panel-4 hover:border-amber/50 hover:text-amber active:translate-y-px active:shadow-well",
        secondary:
          "border-amber/20 bg-panel-2 text-bone-soft hover:bg-panel-3 hover:border-amber/40 hover:text-bone active:translate-y-px",
        ghost:
          "border-transparent text-bone-soft hover:bg-amber/10 hover:text-amber active:translate-y-px",
        destructive:
          "border-blood/70 bg-blood/15 text-blood hover:bg-blood/30 hover:text-[#E8594D] active:translate-y-px",
        link:
          "border-transparent text-amber underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3",
        xs: "h-6 px-2 text-legend [&_svg:not([class*=\'size-\'])]:size-3",
        sm: "h-8 px-2.5 text-legend [&_svg:not([class*=\'size-\'])]:size-3",
        lg: "h-11 px-5 text-caption",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*=\'size-\'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*=\'size-\'])]:size-3",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants }
