import React, { useEffect, useRef } from "react"
import { motion, useMotionValue,useTransform } from "motion/react"

/** ----------------- Global pointer (shared by all balls) ----------------- */
const POINTER = { x: 0, y: 0 }
let hasPointerListener = false
function ensurePointerListener() {
  if (hasPointerListener) return
  hasPointerListener = true
  window.addEventListener("pointermove", (e) => {
    POINTER.x = e.clientX
    POINTER.y = e.clientY
  })
}

/** ----------------- Repel settings (pure function of cursor) ------------- */
const INFLUENCE_PX = 100      // radius of influence
const MAX_PUSH_PX = 50        // max translation magnitude (px)
const POWER = 0.1             // falloff curve: 1 linear, 2 quadratic, >2 sharper
const LERP = 0.05             // easing each frame (0..1): higher = snappier

function repelOffset(cx, cy, px, py) {
  const dx = px - cx
  const dy = py - cy
  const dist = Math.hypot(dx, dy)
  if (dist === 0) return { x: 0, y: 0 }
  if (dist >= INFLUENCE_PX) return { x: 0, y: 0 }

  // unit vector away from pointer
  const ux = dx / dist
  const uy = dy / dist

  // closer → stronger; 0 at edge, MAX_PUSH at center
  const t = 1 - dist / INFLUENCE_PX
  const force = Math.pow(t, POWER) * MAX_PUSH_PX

  return { x: -ux * force, y: -uy * force }
}

/** ----------------- Hook: repel from pointer (no springs) ----------------- */


function useRepelFromPointer(ref) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const proximity = useMotionValue(0) // 0 = far, 1 = very close
  const center = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)

  useEffect(() => {
    ensurePointerListener()
    if (!ref.current) return

    const computeCenter = () => {
      const rect = ref.current.getBoundingClientRect()
      center.current.x = rect.left + rect.width / 2
      center.current.y = rect.top + rect.height / 2
    }

    computeCenter()
    const onResize = () => computeCenter()
    window.addEventListener("resize", onResize)

    const loop = () => {
      // distance + repulsion
      const dx = POINTER.x - center.current.x
      const dy = POINTER.y - center.current.y
      const dist = Math.hypot(dx, dy)

      // 0..1 proximity inside influence radius
      const t = Math.max(0, 1 - dist / INFLUENCE_PX)
      proximity.set(t)

      // repel offset purely from cursor position
      if (dist > 0 && dist < INFLUENCE_PX) {
        const ux = dx / dist
        const uy = dy / dist
        const force = Math.pow(t, POWER) * MAX_PUSH_PX
        const tx = -ux * force
        const ty = -uy * force

        // ease via lerp
        x.set(x.get() + (tx - x.get()) * LERP)
        y.set(y.get() + (ty - y.get()) * LERP)
      } else {
        // ease back to 0 when outside influence
        x.set(x.get() + (0 - x.get()) * LERP)
        y.set(y.get() + (0 - y.get()) * LERP)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
      window.addEventListener("scroll", onResize, { passive: true })
    }
  }, [])

  return { x, y, proximity }
}


/** ----------------- Your components -------------------------------------- */

const BenDay = ({children}) => {
  const NUM_BALLS = 36 * 36

  return (
    <div className="relative h-full w-full overflow-hidden">
        {children}
        <div className="absolute top-0 left-0 -z-50">
      <div className="h-screen w-screen grid grid-cols-36 gap-4 ">
        {Array.from({ length: NUM_BALLS }).map((_, i) => (
          <Drag key={i} parity={Math.floor(i/36)%2} />
        ))}

        
      </div>
      </div>
    </div>
  )
}

export default BenDay


function Drag({parity}) {
  const ref = useRef(null)
  const { x, y, proximity } = useRepelFromPointer(ref)

  // Map proximity (0..1) → size (px) and opacity
  const size = 10        // far→near
  const opacity = useTransform(proximity, [0, 1], [1, 1])

  return (
    <div className={`flex items-center ${parity==0?"justify-center":""}`}>
      <motion.div
        ref={ref}
        style={{
          x,
          y,
          width: size,
          height: size,
          opacity,
          backgroundColor: "#5d7687ff",
          borderRadius: "50%",
        }}
      />
    </div>
  )
}


/** ----------------- Styles ----------------------------------------------- */
