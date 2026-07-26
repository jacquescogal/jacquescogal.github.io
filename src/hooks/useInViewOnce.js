import { useEffect, useState } from "react";

/**
 * Fires true the first time an element is meaningfully on screen, and stays
 * true. Used for the reactive moments — a readout coming up to power should
 * happen once, when the visitor arrives at it, not every time they scroll past.
 */
export const useInViewOnce = (ref, { threshold = 0.35, rootMargin = "0px 0px -10% 0px" } = {}) => {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    // Without an observer (jsdom, older engines) the content is simply present.
    if (typeof IntersectionObserver !== "function") {
      setSeen(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, seen, threshold, rootMargin]);

  return seen;
};
