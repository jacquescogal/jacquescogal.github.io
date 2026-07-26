import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The room the console sits in.
 *
 * Dust drifts through the light on its own clock — that is the room being a
 * place. Parallax moves the light and the dust against the hero plate as the
 * visitor scrolls — that is the room having depth. Ambient motion never
 * competes with the reactive motion on the instruments, so atmosphere and
 * machinery stay legible as two different things.
 *
 * Motes are spans rather than a canvas. A hundred composited transforms are
 * cheap, and this ships to a static host where a particle library would be the
 * heaviest thing on the page.
 */

/* Dust is the colour of whatever is lighting it, and the key light here is
   sodium. Cold motes are the fill light from the far side, which is why they
   thin out toward the left of a surface — the same warm-key / cold-rim split
   the whole world is built on. A field of blue-white specks in an amber room
   was lit by nothing. */
const WARM = {
  core: "rgba(255, 222, 168, 0.95)",
  mid: "rgba(242, 169, 59, 0.62)",
};
const COLD = {
  core: "rgba(226, 240, 244, 0.9)",
  mid: "rgba(127, 178, 191, 0.5)",
};

/* mulberry32. Deterministic, eight lines, and it makes each field legible in
   source: the shape of the room is in the ranges below, not in a hundred
   hand-typed literals nobody can scan. Seeded, so every visit, every re-render
   and every screenshot show the same room. */
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* The first cut of these numbers was 30 motes of 1–2px at 9–20% opacity: one
   speck per 11,000-odd square pixels, every one below the threshold where a
   dark screen shows anything. Measured, they animated perfectly. Looked at,
   the hero was empty. `scale` trims the field for smaller surfaces without
   losing the ranges that make it read. */
const buildField = ({ count, seed, scale = 1, spread = 1, grazing = false }) => {
  let next = seeded(seed);
  const field = [];
  for (let index = 0; index < count; index += 1) {
    const r = () => {
      const value = next();
      next = seeded(Math.floor(value * 0xffffffff));
      return value;
    };
    const near = r() > 0.55; // Foreground motes are bigger, brighter, faster.
    const x = r() * 100;
    // Warm toward the key light, cold toward the fill, with enough jitter that
    // the split never reads as a hard line down the middle.
    const warm = x < 58 + (r() - 0.5) * 46;
    field.push({
      x,
      y: grazing ? 6 + r() * 88 : 8 + r() * 96,
      size: (near ? 3.5 + r() * 3.5 : 2 + r() * 1.6) * scale,
      // A shallow band needs the drift turned on its side. Dust rising 150px
      // out of a 48px strip is outside the clip for most of its cycle, which
      // is why the nameplates looked empty: the motes were there, just never
      // in frame. Grazing light travels along the plate instead.
      dx: grazing ? (r() > 0.5 ? 1 : -1) * (70 + r() * 90) : (r() - 0.5) * 90 * spread,
      dy: grazing ? (r() - 0.5) * 22 : -(150 + r() * 190) * spread,
      dur: grazing ? 17 + r() * 13 : near ? 13 + r() * 7 : 19 + r() * 9,
      delay: -r() * 26,
      peak: near ? 0.42 + r() * 0.34 : 0.2 + r() * 0.22,
      tone: warm ? WARM : COLD,
    });
  }
  return field;
};

const FIELDS = {
  hero: buildField({ count: 58, seed: 0x1f5e }),
  // The analysis engine's well: tall, dark and otherwise empty.
  dock: buildField({ count: 16, seed: 0x7a31, scale: 0.85 }),
  // Sector nameplates: a shallow band lit at a grazing angle.
  plate: buildField({ count: 11, seed: 0x2c07, scale: 0.8, grazing: true }),
};

/**
 * A drifting dust field sized to its surface. The parent must establish a
 * containing block; every field clips to it.
 */
export const MoteField = ({ variant = "hero", className }) => {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {FIELDS[variant].map((mote, index) => (
        <span
          key={index}
          className="mote animate-mote"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            "--mote-dx": `${mote.dx}px`,
            "--mote-dy": `${mote.dy}px`,
            "--mote-dur": `${mote.dur}s`,
            // Negative delays start the field mid-drift, so nothing has to fade
            // up from nothing on arrival.
            "--mote-delay": `${mote.delay}s`,
            "--mote-peak": mote.peak,
            "--mote-core": mote.tone.core,
            "--mote-mid": mote.tone.mid,
          }}
        />
      ))}
    </span>
  );
};

/**
 * Writes the hero's own scroll offset onto the element as a custom property,
 * on a rAF, and only while the hero is on screen. Layers inside read it at
 * whatever rate suits them, so the depth is declared in CSS rather than
 * recomputed per layer in JavaScript.
 */
const useHeroParallax = (ref, enabled) => {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;
    if (typeof IntersectionObserver !== "function" || typeof requestAnimationFrame !== "function") {
      return undefined;
    }

    let frame = null;
    // Measured when the plate enters view, then read from scrollY. Calling
    // getBoundingClientRect on every scroll frame would force a layout each
    // time; the plate's document offset does not move while it is on screen.
    let plateTop = 0;

    const write = () => {
      frame = null;
      // 0 while the plate's top sits at the viewport top, growing as it leaves.
      node.style.setProperty("--hero-scroll", String(Math.max(0, window.scrollY - plateTop)));
    };

    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(write);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          plateTop = node.getBoundingClientRect().top + window.scrollY;
          window.addEventListener("scroll", schedule, { passive: true });
          schedule();
        } else {
          window.removeEventListener("scroll", schedule);
        }
      },
      { threshold: 0 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
      node.style.removeProperty("--hero-scroll");
    };
  }, [ref, enabled]);
};

export const HeroAtmosphere = ({ plateRef }) => {
  const reduced = useReducedMotion();
  useHeroParallax(plateRef, !reduced);

  return (
    <>
      {/* The haze drifts up faster than the plate, so the light in the room
          reads as sitting behind the content rather than painted on it. */}
      <span
        aria-hidden="true"
        className="haze pointer-events-none absolute inset-0"
        style={{ transform: "translate3d(0, calc(var(--hero-scroll, 0) * 0.16px), 0)" }}
      />
      {/* The moving mass of light. Slow, soft and large — the layer that
          actually reads as motion from across a room. */}
      {!reduced && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1/4 animate-light-drift"
          style={{
            backgroundImage:
              "radial-gradient(38% 46% at 26% 34%, rgba(242,169,59,0.20) 0%, rgba(242,169,59,0.07) 42%, transparent 70%)",
          }}
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ transform: "translate3d(0, calc(var(--hero-scroll, 0) * 0.34px), 0)" }}
      >
        <MoteField variant="hero" />
      </span>
    </>
  );
};

/**
 * The portrait's own parallax rate. Slower than the room, so the subject holds
 * still while the light moves past — the plate reads as having depth without
 * anything visibly sliding.
 */
export const useSubjectParallaxStyle = () => ({
  transform: "translate3d(0, calc(var(--hero-scroll, 0) * -0.07px), 0)",
});

export default HeroAtmosphere;
