import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Channel selector. The selected channel lights its own colour along the rail
 * beneath it; set it with style={{ "--ch": "#7FB2BF" }} on the trigger.
 */
function Tabs({ className, orientation = "horizontal", ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row",
        className
      )}
      {...props} />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-stretch gap-0 border-b border-amber/15", className)}
      {...props} />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 border-b-2 border-transparent px-3.5 pb-2.5 pt-2 font-console text-[0.6rem] font-semibold uppercase tracking-console text-bone-faint transition-colors outline-none hover:text-bone-soft focus-visible:text-bone disabled:pointer-events-none disabled:opacity-40 data-[state=active]:border-[color:var(--ch,theme(colors.amber.DEFAULT))] data-[state=active]:text-bone [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3",
        className
      )}
      {...props} />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
