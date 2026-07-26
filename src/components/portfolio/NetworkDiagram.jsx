import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The module graph.
 *
 * Not an illustration of the page — it IS the page's navigation. Each section
 * is a node on the bus; the analysis engine sits on a branch that reaches all
 * of them, because the assistant really can route anywhere. When it cites
 * evidence, `traceTarget` fires and the route it took is drawn in amber.
 *
 * Routing is orthogonal with 45-degree elbows, the way a real signal or
 * dependency diagram routes. Nodes are square; the addressed node wears
 * reticle brackets.
 */

const LAYOUTS = {
  horizontal: {
    width: 1000,
    height: 190,
    busFrom: [180, 78],
    busTo: [946, 78],
    branch: "M 56,180 H 78 L 180,78",
    engine: [56, 180],
    nodeAt: (index, total) => {
      const first = 214;
      const last = 946;
      const step = total > 1 ? (last - first) / (total - 1) : 0;
      return [first + step * index, 78];
    },
  },
  vertical: {
    width: 300,
    height: 560,
    busFrom: [40, 148],
    busTo: [40, 528],
    branch: "M 112,48 V 76 L 40,148",
    engine: [112, 48],
    nodeAt: (index, total) => {
      const first = 184;
      const last = 528;
      const step = total > 1 ? (last - first) / (total - 1) : 0;
      return [40, first + step * index];
    },
  },
};

/* The bus runs sideways only when the graph's own container can hold five
   labelled nodes. Keying off the window instead of the container is what
   crowds the labels: at 768px the graph sits in a narrow column, so a viewport
   query says "wide" while the element is anything but. */
const HORIZONTAL_MIN_WIDTH = 620;

const useLayoutMode = (containerRef) => {
  const [mode, setMode] = useState("vertical");

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const apply = (width) => {
      setMode(width >= HORIZONTAL_MIN_WIDTH ? "horizontal" : "vertical");
    };

    if (typeof ResizeObserver !== "function") {
      // No observer (older engines, jsdom): measure once and follow the window.
      apply(node.getBoundingClientRect().width);
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef]);

  return mode;
};

const NetworkDiagram = ({
  stations,
  currentSection,
  visitedSections,
  traceTarget,
  onSelect,
  onSelectAssistant,
  className,
}) => {
  const containerRef = useRef(null);
  const mode = useLayoutMode(containerRef);
  const layout = LAYOUTS[mode];
  const traceRef = useRef(null);
  const [traceLength, setTraceLength] = useState(0);

  const geometry = useMemo(
    () =>
      stations.map((station, index) => ({
        ...station,
        point: layout.nodeAt(index, stations.length),
        index,
      })),
    [stations, layout]
  );

  const tracePath = useMemo(() => {
    if (!traceTarget) return null;
    const destination = geometry.find((node) => node.id === traceTarget);
    if (!destination) return null;
    const [dx, dy] = destination.point;
    return mode === "horizontal"
      ? `${layout.branch} H ${dx}`
      : `${layout.branch} V ${dy}`;
  }, [traceTarget, geometry, layout, mode]);

  useLayoutEffect(() => {
    if (!tracePath || !traceRef.current) return;
    if (typeof traceRef.current.getTotalLength !== "function") return;
    setTraceLength(traceRef.current.getTotalLength());
  }, [tracePath]);

  const toPercent = ([x, y]) => ({
    left: `${(x / layout.width) * 100}%`,
    top: `${(y / layout.height) * 100}%`,
  });

  const NODE = 9;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
    >
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        {/* The coordinate field, in the diagram's own units so its lines land
            on the plotted nodes instead of a pixel tile that ignores them. */}
        <g stroke="#F2A93B" strokeOpacity="0.07" strokeWidth="1">
          {geometry.map((node) => (
            <line
              key={`grid-x-${node.id}`}
              x1={node.point[0]}
              y1="0"
              x2={node.point[0]}
              y2={layout.height}
            />
          ))}
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={`grid-y-${fraction}`}
              x1="0"
              y1={layout.height * fraction}
              x2={layout.width}
              y2={layout.height * fraction}
            />
          ))}
          <line
            x1={layout.engine[0]}
            y1="0"
            x2={layout.engine[0]}
            y2={layout.height}
          />
        </g>

        {/* The unlit bus. */}
        <path
          d={`M ${layout.busFrom[0]},${layout.busFrom[1]} ${
            mode === "horizontal" ? `H ${layout.busTo[0]}` : `V ${layout.busTo[1]}`
          }`}
          stroke="#6E6355"
          strokeOpacity="0.75"
          strokeWidth="2"
          fill="none"
        />
        {/* The engine's branch onto the bus. */}
        <path
          d={layout.branch}
          stroke="#6E6355"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Segments already traversed carry current. */}
        {geometry.map((node, index) => {
          if (index === 0) return null;
          const previous = geometry[index - 1].point;
          const current = node.point;
          const energised =
            visitedSections.includes(geometry[index - 1].id) &&
            visitedSections.includes(node.id);
          if (!energised) return null;
          return (
            <path
              key={`live-${node.id}`}
              d={`M ${previous[0]},${previous[1]} ${
                mode === "horizontal" ? `H ${current[0]}` : `V ${current[1]}`
              }`}
              stroke="#B4762A"
              strokeWidth="2"
              fill="none"
            />
          );
        })}

        {/* The traced retrieval route. Drawn, never faded in. */}
        {tracePath && (
          <path
            key={`${traceTarget}-${tracePath}`}
            ref={traceRef}
            d={tracePath}
            stroke="#F2A93B"
            strokeWidth="3"
            strokeLinejoin="miter"
            fill="none"
            className="trace-path"
            style={{ "--trace-len": traceLength || 2000 }}
          />
        )}

        {/* Module nodes: square, because this is a bus and not a railway. */}
        {geometry.map((node) => {
          const [x, y] = node.point;
          const isCurrent = currentSection === node.id;
          const isVisited = visitedSections.includes(node.id);
          return (
            <g key={`node-${node.id}`}>
              <rect
                x={x - NODE / 2}
                y={y - NODE / 2}
                width={NODE}
                height={NODE}
                fill={isVisited ? node.color : "#0B0907"}
                stroke={isVisited ? node.color : "#6E6355"}
                strokeWidth="2"
              />
              {isCurrent && (
                <>
                  {/* Reticle brackets mark the addressed node. */}
                  {[
                    [-11, -11, 5, 0, 0, 5],
                    [11, -11, -5, 0, 0, 5],
                    [-11, 11, 5, 0, 0, -5],
                    [11, 11, -5, 0, 0, -5],
                  ].map(([ox, oy, hx, hy, vx, vy], cornerIndex) => (
                    <g key={cornerIndex} stroke="#F2A93B" strokeWidth="2" fill="none">
                      <line x1={x + ox} y1={y + oy} x2={x + ox + hx} y2={y + oy + hy} />
                      <line x1={x + ox} y1={y + oy} x2={x + ox + vx} y2={y + oy + vy} />
                    </g>
                  ))}
                </>
              )}
              {traceTarget === node.id && (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="none"
                  stroke="#F2A93B"
                  strokeWidth="2"
                  className="animate-node-ping"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}
            </g>
          );
        })}

        {/* The analysis engine: a larger node with a lit core. */}
        <rect
          x={layout.engine[0] - 8}
          y={layout.engine[1] - 8}
          width="16"
          height="16"
          fill="#0B0907"
          stroke="#F2A93B"
          strokeWidth="2.5"
        />
        <rect
          x={layout.engine[0] - 3}
          y={layout.engine[1] - 3}
          width="6"
          height="6"
          fill="#F2A93B"
        />
      </svg>

      {/* Real buttons on the graph. Focus, keyboard, and hit targets are the
          browser's, not a re-implementation. Labelled, because these are the
          same five destinations as the header rail and assistive tech needs to
          tell the two sets apart. */}
      <nav aria-label="Module graph" className="absolute inset-0">
        {geometry.map((node) => {
          const isCurrent = currentSection === node.id;
          const isVisited = visitedSections.includes(node.id);
          // Alternate above and below the bus so long labels never collide.
          const above = mode === "horizontal" && node.index % 2 === 1;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect?.(node.target)}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "absolute flex min-w-max items-baseline gap-1.5 rounded-unit px-1.5 py-1 font-console text-[0.55rem] font-semibold uppercase tracking-console transition-colors sm:text-[0.62rem]",
                mode === "horizontal"
                  ? above
                    ? "-translate-x-1/2 -translate-y-[1.9rem]"
                    : "-translate-x-1/2 translate-y-3.5"
                  : "translate-x-5 -translate-y-1/2",
                isCurrent
                  ? "text-amber"
                  : isVisited
                    ? "text-bone-soft hover:text-amber"
                    : "text-bone-faint hover:text-amber"
              )}
              style={toPercent(node.point)}
            >
              <span className="tabular text-[0.5rem] text-bone-faint">
                {String(node.index + 1).padStart(2, "0")}
              </span>
              {node.label}
            </button>
          );
        })}

        {/* The engine label runs rightwards off its node, so it can never
            overflow the panel's left edge. */}
        <button
          type="button"
          onClick={() => onSelectAssistant?.()}
          className={cn(
            "absolute flex min-w-max items-baseline gap-1.5 rounded-unit px-1.5 py-1 font-console text-[0.55rem] font-semibold uppercase tracking-console text-amber transition-colors hover:text-bone sm:text-[0.62rem]",
            mode === "horizontal"
              ? "-translate-x-2 translate-y-3.5"
              : "translate-x-6 -translate-y-1/2"
          )}
          style={toPercent(layout.engine)}
        >
          Jacques AI
          <span className="text-[0.5rem] font-normal normal-case tracking-normal text-bone-faint">
            analysis engine
          </span>
        </button>
      </nav>
    </div>
  );
};

export default NetworkDiagram;
