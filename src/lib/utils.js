import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about the console's type ramp.
 *
 * The ramp uses word keys (text-label, text-body, ...). Out of the box
 * tailwind-merge only recognises its built-in font-size scale, so it reads an
 * unknown `text-<word>` as a *colour* utility. That put `text-label` and
 * `text-bone-faint` in the same conflict group and silently dropped the size,
 * leaving those elements at the inherited 16px. Registering the ramp as
 * font-size keeps size and colour independent.
 */
const FONT_SIZE_STEPS = [
  "micro",
  "legend",
  "label",
  "data",
  "caption",
  "body",
  "lede",
  "title",
  "display",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZE_STEPS }],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
