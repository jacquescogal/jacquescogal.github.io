import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether this visitor has asked for reduced motion.
 *
 * CSS handles the animations it can reach. This is for the motion that only
 * exists in JavaScript — scroll parallax and counting readouts — which a media
 * query cannot switch off on its own.
 */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia(QUERY);
    const apply = (event) => setReduced(event.matches);
    apply(media);

    // Safari below 14 only has the deprecated listener API.
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
    media.addListener(apply);
    return () => media.removeListener(apply);
  }, []);

  return reduced;
};
