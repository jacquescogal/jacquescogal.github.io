import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A record on the console: machined plate, warm hairline, hard corners.
 */
function Card({
  className,
  size = "default",
  ...props
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "plate group/card flex flex-col gap-4 overflow-hidden rounded-unit py-4 text-sm data-[size=sm]:gap-3 data-[size=sm]:py-3",
        className
      )}
      {...props} />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header grid auto-rows-min items-start gap-1 px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props} />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-console text-[0.82rem] font-bold uppercase leading-snug tracking-console text-bone",
        className
      )}
      {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-6 text-bone-soft", className)}
      {...props} />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props} />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props} />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-auto flex items-center border-t border-amber/15 bg-panel-2 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
