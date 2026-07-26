import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Channel chips and console legends. Hard-cornered, small, letterspaced.
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-unit border px-1.5 py-0.5 font-console text-[0.55rem] font-semibold uppercase tracking-console whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-amber/70 bg-amber text-[#17110A]",
        secondary: "border-amber/20 bg-panel-3 text-bone-soft",
        destructive: "border-blood/60 bg-blood/20 text-blood",
        outline: "border-amber/30 bg-transparent text-amber/80",
        ghost: "border-transparent bg-transparent text-bone-faint",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
