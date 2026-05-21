import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

const PopoverTrigger = React.forwardRef(({
  ...props
}, ref) => (
  <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = React.forwardRef(({
  ...props
}, ref) => (
  <PopoverPrimitive.Anchor ref={ref} data-slot="popover-anchor" {...props} />
));
PopoverAnchor.displayName = "PopoverAnchor";

const PopoverContent = React.forwardRef(({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-80 origin-(--radix-popover-content-transform-origin) rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-xl outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props} />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
}
