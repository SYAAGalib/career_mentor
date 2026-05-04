import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, Play, FileQuestion, Zap, Trophy, Home, BarChart3, Award, Settings, ChevronRight, LayoutGrid, List, SlidersHorizontal, X, GraduationCap } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { Milestone } from "@/lib/store";
import { cn } from "@/lib/utils";
import RoadmapGraphView from "@/components/RoadmapGraphView";

function getNodeColor(status: Milestone["status"]) {
  switch (status) {
    case "locked": return "border-node-locked bg-node-locked/30 text-muted-foreground";
    case "unlocked": return "border-node-unlocked bg-node-unlocked/10 text-node-unlocked glow-primary";
    case "in_progress": return "border-node-progress bg-node-progress/10 text-node-progress";
    case "exam_ready": return "border-node-exam bg-node-exam/10 text-node-exam glow-warning";
    case "passed": return "border-node-passed bg-node-passed/10 text-node-passed glow-success";
    default: return "border-border bg-card";
  }
}

function getStatusIcon(status: Milestone["status"]) {
  switch (status) {
    case "locked": return <Lock className="w-4 h-4" />;
    case "unlocked": return <Play className="w-4 h-4" />;
    case "in_progress": return <Play className="w-4 h-4" />;
    case "exam_ready": return <FileQuestion className="w-4 h-4" />;
    case "passed": return <CheckCircle2 className="w-4 h-4" />;
    default: return null;
  }
}

function getDifficultyColor(d: string) {
  if (d === "beginner") return "text-success";
  if (d === "intermediate") return "text-warning";
  return "text-destructive";
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { state, recentlyUnlocked } = useApp();
  const roadmap = state.roadmap;
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "completed" | "locked">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = (filterStatus !== "all" ? 1 : 0) + (filterDifficulty !== "all" ? 1 : 0);
  if (!roadmap) {
    navigate("/onboarding");
    return null;
  }

  const completedCount = roadmap.milestones.filter(m => m.status === "passed").length;
  const progressPct = Math.round((completedCount / roadmap.milestones.length) * 100);

  const getFilteredMilestones = (milestones: Milestone[]) => {
    let filtered = milestones;
    switch (filterStatus) {
      case "available":
        filtered = filtered.filter(m => m.status !== "locked" && m.status !== "passed");
        break;
      case "completed":
        filtered = filtered.filter(m => m.status === "passed");
        break;
      case "locked":
        filtered = filtered.filter(m => m.status === "locked");
        break;
    }
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(m => m.difficulty === filterDifficulty);
    }
    return filtered;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-foreground text-lg">{roadmap.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-xp" />{state.progress.totalXp} XP</span>
              <span>{completedCount}/{roadmap.milestones.length} milestones</span>
              <span>{progressPct}% complete</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.progress.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-streak/10 text-streak text-xs font-medium">
                🔥 {state.progress.currentStreak}
              </div>
            )}
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative p-2 rounded-lg transition-colors",
                showFilters || activeFilterCount > 0
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* View toggle - hidden on mobile */}
            <div className="hidden md:flex items-center bg-card border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === "graph" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="px-4 py-3 space-y-3">
                {/* Status */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">Status</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "available", "completed", "locked"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status as typeof filterStatus)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                          filterStatus === status
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Difficulty */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">Difficulty</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "all", label: "All" },
                      { value: "beginner", label: "Beginner", dot: "bg-success" },
                      { value: "intermediate", label: "Intermediate", dot: "bg-warning" },
                      { value: "advanced", label: "Advanced", dot: "bg-destructive" },
                    ].map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => setFilterDifficulty(diff.value as typeof filterDifficulty)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                          filterDifficulty === diff.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {diff.dot && <span className={cn("w-2 h-2 rounded-full", diff.dot)} />}
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterStatus("all"); setFilterDifficulty("all"); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-0.5 bg-muted">
          <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Graph view */}
      {viewMode === "graph" ? (
        <div className="relative" style={{ height: "calc(100vh - 140px)" }}>
          <RoadmapGraphView roadmap={roadmap} />
        </div>
      ) : (
        /* List view */
        <div className="max-w-3xl mx-auto px-4 pt-6">
          {roadmap.sections.map((section, si) => {
            const sectionMilestones = roadmap.milestones.filter(m => m.sectionId === section.id).sort((a, b) => a.orderIndex - b.orderIndex);
            return (
              <div key={section.id} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {si + 1}
                  </div>
                  <h2 className="font-heading font-semibold text-foreground">{section.title}</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{section.description}</span>
                </div>

                <div className="space-y-3 relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                  {sectionMilestones.filter(m => getFilteredMilestones([m]).length > 0).map((milestone, mi) => {
                    const goalsDone = milestone.goals.filter(g => g.completed).length;
                    const goalsTotal = milestone.goals.length;
                    const isClickable = milestone.status !== "locked";

                    return (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mi * 0.05 }}
                      >
                        <button
                          disabled={!isClickable}
                          onClick={() => isClickable && navigate(`/milestone/${milestone.id}`)}
                          className={cn(
                            "w-full text-left relative pl-14 pr-4 py-4 rounded-xl border-2 transition-all",
                            getNodeColor(milestone.status),
                            isClickable && "hover:scale-[1.01] cursor-pointer",
                            !isClickable && "opacity-50 cursor-not-allowed",
                            recentlyUnlocked.includes(milestone.id) && "animate-unlock"
                          )}
                        >
                          <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10",
                            milestone.status === "passed" ? "bg-node-passed border-node-passed" :
                            milestone.status === "locked" ? "bg-node-locked border-node-locked" :
                            "bg-background border-current"
                          )}>
                            {getStatusIcon(milestone.status)}
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-heading font-semibold text-sm truncate">{milestone.title}</h3>
                                <span className={cn("text-[10px] uppercase tracking-wider font-medium", getDifficultyColor(milestone.difficulty))}>
                                  {milestone.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{milestone.description}</p>
                              {milestone.status !== "locked" && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span>{goalsDone}/{goalsTotal} goals</span>
                                  <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-xp" />{milestone.rewardXp} XP</span>
                                  <span>{milestone.estimatedTime}</span>
                                  {milestone.examScore !== undefined && (
                                    <span className={milestone.examScore >= 80 ? "text-success" : "text-destructive"}>
                                      Exam: {milestone.examScore}%
                                    </span>
                                  )}
                                </div>
                              )}
                              {milestone.status === "locked" && milestone.dependsOn.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Complete prerequisites to unlock
                                </p>
                              )}
                            </div>
                            {isClickable && <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-20">
        <div className="max-w-3xl mx-auto flex justify-around py-2">
          {[
            { icon: Home, label: "Home", path: "/" },
            { icon: Trophy, label: "Roadmap", path: "/roadmap", active: true },
            { icon: GraduationCap, label: "Certificate", path: "/certificate" },
            { icon: BarChart3, label: "Progress", path: "/progress" },
            { icon: Award, label: "Rewards", path: "/achievements" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
