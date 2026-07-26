import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * An input well: recessed, hard-cornered, with an amber caret and a lit edge
 * on focus. Values are typed in console face; prompts are dimmed phosphor.
 */
function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-unit border border-amber/20 bg-void-deep px-3 py-1 font-console text-[0.78rem] text-bone shadow-well caret-amber transition-colors outline-none placeholder:text-bone-faint focus-visible:border-amber focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-amber disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-panel-2 disabled:opacity-60",
        className
      )}
      {...props} />
  );
}

export { Input }
