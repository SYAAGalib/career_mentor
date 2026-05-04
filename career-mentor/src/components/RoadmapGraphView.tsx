import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, FileQuestion, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Roadmap, Milestone } from "@/lib/store";
import { useApp } from "@/lib/AppContext";
import { cn } from "@/lib/utils";

interface Props {
  roadmap: Roadmap;
}

const NODE_W = 220;
const NODE_H = 80;
const GAP_X = 280;
const GAP_Y = 120;
const PADDING = 60;

function getStatusColor(status: Milestone["status"]) {
  switch (status) {
    case "locked": return "border-node-locked bg-node-locked/30 text-muted-foreground";
    case "unlocked": return "border-node-unlocked bg-node-unlocked/10 text-node-unlocked";
    case "in_progress": return "border-node-progress bg-node-progress/10 text-node-progress";
    case "exam_ready": return "border-node-exam bg-node-exam/10 text-node-exam";
    case "passed": return "border-node-passed bg-node-passed/10 text-node-passed";
    default: return "border-border bg-card";
  }
}

function getStatusIcon(status: Milestone["status"]) {
  switch (status) {
    case "locked": return <Lock className="w-3.5 h-3.5" />;
    case "unlocked": return <Play className="w-3.5 h-3.5" />;
    case "in_progress": return <Play className="w-3.5 h-3.5" />;
    case "exam_ready": return <FileQuestion className="w-3.5 h-3.5" />;
    case "passed": return <CheckCircle2 className="w-3.5 h-3.5" />;
    default: return null;
  }
}

function getStatusStroke(status: Milestone["status"]) {
  switch (status) {
    case "passed": return "hsl(152, 69%, 50%)";
    case "unlocked": case "in_progress": return "hsl(173, 80%, 50%)";
    case "exam_ready": return "hsl(38, 92%, 55%)";
    default: return "hsl(220, 14%, 18%)";
  }
}

export default function RoadmapGraphView({ roadmap }: Props) {
  const navigate = useNavigate();
  const { recentlyUnlocked } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layout: assign x,y positions per milestone based on section and order
  const positions = useCallback(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const sectionIds = roadmap.sections.map(s => s.id);

    sectionIds.forEach((sId, si) => {
      const sectionMs = roadmap.milestones
        .filter(m => m.sectionId === sId)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      sectionMs.forEach((m, mi) => {
        // Check if parallel — place side by side
        const parallelIndex = sectionMs.filter(
          (pm, pi) => pi < mi && pm.parallelWith.includes(m.id)
        ).length;

        pos[m.id] = {
          x: PADDING + si * GAP_X,
          y: PADDING + mi * GAP_Y + parallelIndex * (NODE_H + 20),
        };
      });
    });
    return pos;
  }, [roadmap])();

  const allX = Object.values(positions).map(p => p.x);
  const allY = Object.values(positions).map(p => p.y);
  const canvasW = Math.max(...allX) + NODE_W + PADDING * 2;
  const canvasH = Math.max(...allY) + NODE_H + PADDING * 2;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(2, Math.max(0.3, z + delta)));
  };

  // Center on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: (rect.width - canvasW * zoom) / 2,
        y: 20,
      });
    }
  }, []);

  // Draw edges
  const edges: { from: string; to: string }[] = [];
  roadmap.milestones.forEach(m => {
    m.dependsOn.forEach(depId => {
      edges.push({ from: depId, to: m.id });
    });
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: canvasW,
          height: canvasH,
          position: "relative",
        }}
      >
        {/* SVG edges */}
        <svg
          width={canvasW}
          height={canvasH}
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {edges.map(({ from, to }) => {
            const fromPos = positions[from];
            const toPos = positions[to];
            if (!fromPos || !toPos) return null;
            const x1 = fromPos.x + NODE_W;
            const y1 = fromPos.y + NODE_H / 2;
            const x2 = toPos.x;
            const y2 = toPos.y + NODE_H / 2;
            const cx = (x1 + x2) / 2;

            const toMilestone = roadmap.milestones.find(m => m.id === to);
            const strokeColor = toMilestone ? getStatusStroke(toMilestone.status) : "hsl(220, 14%, 18%)";

            return (
              <path
                key={`${from}-${to}`}
                d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2}
                strokeDasharray={toMilestone?.status === "locked" ? "6 4" : "none"}
                opacity={toMilestone?.status === "locked" ? 0.3 : 0.6}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {roadmap.milestones.map(m => {
          const pos = positions[m.id];
          if (!pos) return null;
          const isClickable = m.status !== "locked";
          const goalsDone = m.goals.filter(g => g.completed).length;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: m.orderIndex * 0.05 }}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: NODE_W,
                height: NODE_H,
              }}
              className={cn(
                "rounded-xl border-2 px-4 py-3 transition-all",
                getStatusColor(m.status),
                isClickable ? "cursor-pointer hover:scale-105" : "opacity-50 cursor-not-allowed",
                m.status === "unlocked" && "glow-primary",
                m.status === "passed" && "glow-success",
                recentlyUnlocked.includes(m.id) && "animate-unlock",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (isClickable) navigate(`/milestone/${m.id}`);
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(m.status)}
                <span className="font-heading font-semibold text-xs truncate flex-1">{m.title}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{goalsDone}/{m.goals.length} goals</span>
                <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-xp" />{m.rewardXp}</span>
                {m.examScore !== undefined && (
                  <span className={m.examScore >= 80 ? "text-success" : "text-destructive"}>
                    {m.examScore}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setZoom(z => Math.min(2, z + 0.2))}
          className="w-8 h-8 rounded-lg bg-card border border-border text-foreground flex items-center justify-center text-sm font-bold hover:bg-secondary"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
          className="w-8 h-8 rounded-lg bg-card border border-border text-foreground flex items-center justify-center text-sm font-bold hover:bg-secondary"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 20 }); }}
          className="px-3 h-8 rounded-lg bg-card border border-border text-foreground flex items-center justify-center text-xs hover:bg-secondary"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
