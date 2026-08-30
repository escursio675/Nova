"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Note } from "@/lib/notes";
import { buildGraphData } from "@/lib/graph";
import { useIsDark } from "@/hooks/useIsDark";

// react-force-graph-2d touches canvas/window at import time, which crashes
// during Next.js server-side rendering — load it client-only.
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphViewProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

// Minimal shape we read off graph nodes, plus the x/y position the force
// simulation assigns once it starts running (added at runtime by the
// library, not part of the data we originally passed in).
interface GraphNodeDatum {
  id: string;
  name: string;
  val: number;
  x?: number;
  y?: number;
}

// Labels only draw once zoomed in this far — otherwise a dense graph would
// be an unreadable wall of overlapping text. Below this threshold, hovering
// a node still shows its name via the tooltip (nodeLabel).
const LABEL_ZOOM_THRESHOLD = 1.5;

function nodeRadius(val: number) {
  return 3 + Math.min(val, 10) * 0.8;
}

export default function GraphView({ notes, selectedNoteId, onSelectNote }: GraphViewProps) {
  const isDark = useIsDark();
  const graphData = useMemo(() => buildGraphData(notes), [notes]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // react-force-graph-2d needs explicit pixel dimensions rather than
  // auto-sizing to its parent, so measure the container ourselves.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nodeColor = isDark ? "#94a3b8" : "#78716c"; // slate-400 / stone-500
  const selectedNodeColor = isDark ? "#f8fafc" : "#1e293b";
  const labelColor = isDark ? "#e2e8f0" : "#292524";
  // Bumped up from the initial pass — the earlier value was too faint to
  // read against the beige/slate backgrounds at a glance.
  const linkColor = isDark ? "rgba(148, 163, 184, 0.55)" : "rgba(87, 83, 78, 0.5)";

  if (notes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-ui text-sm text-slate-400 dark:text-slate-500">
          Open a vault to see its graph.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      {dimensions.width > 0 && (
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeRelSize={4}
          nodeLabel={(node) => (node as GraphNodeDatum).name}
          linkColor={() => linkColor}
          linkWidth={1.5}
          onNodeClick={(node) => onSelectNote((node as GraphNodeDatum).id)}
          cooldownTicks={100}
          // Custom drawing replaces the library's default dot, so we can
          // conditionally add a text label based on current zoom level.
          nodeCanvasObjectMode={() => "replace"}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as GraphNodeDatum;
            const radius = nodeRadius(n.val);
            const isSelected = n.id === selectedNoteId;
            const x = n.x ?? 0;
            const y = n.y ?? 0;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = isSelected ? selectedNodeColor : nodeColor;
            ctx.fill();

            if (globalScale > LABEL_ZOOM_THRESHOLD) {
              // Divide by globalScale so the text stays a constant size on
              // screen regardless of zoom level, rather than scaling with it.
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillStyle = labelColor;
              ctx.fillText(n.name, x, y + radius + 2);
            }
          }}
          // Required alongside custom nodeCanvasObject — without this, click
          // hit-detection reverts to a default that doesn't match our
          // custom-drawn circle size, making nodes hard to click accurately.
          nodePointerAreaPaint={(node, color, ctx) => {
            const n = node as GraphNodeDatum;
            const radius = nodeRadius(n.val);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x ?? 0, n.y ?? 0, radius, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />
      )}
    </div>
  );
}