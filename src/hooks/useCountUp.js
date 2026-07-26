import { useEffect, useRef, useState } from "react";

/**
 * Counts a readout up to its real value the first time it is looked at.
 *
 * The number is never invented — it starts from the value the feed actually
 * returned and lands on it. If the visitor has asked for reduced motion, or the
 * value arrives while the readout is already on screen, it simply reads
 * correctly from the first frame.
 */
export const useCountUp = (target, { active, reduced, duration = 620 } = {}) => {
  const [value, setValue] = useState(active && !reduced ? 0 : target);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!active || reduced || typeof requestAnimationFrame !== "function") {
      setValue(target);
      return undefined;
    }

    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Exponential ease-out: fast off the mark, settling rather than braking.
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, active, reduced, duration]);

  return value;
};
