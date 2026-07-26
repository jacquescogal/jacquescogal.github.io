import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-unit border border-amber/20 bg-void-deep px-3 py-2 font-console text-[0.78rem] leading-6 text-bone shadow-well caret-amber transition-colors outline-none placeholder:text-bone-faint focus-visible:border-amber focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-amber disabled:cursor-not-allowed disabled:bg-panel-2 disabled:opacity-60",
        className
      )}
      {...props} />
  );
}

export { Textarea }
