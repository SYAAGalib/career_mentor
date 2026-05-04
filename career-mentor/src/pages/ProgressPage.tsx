import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Trophy, Target, BarChart3, CheckCircle2, Flame } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function ProgressPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const roadmap = state.roadmap;
  const progress = state.progress;

  if (!roadmap) {
    navigate("/onboarding");
    return null;
  }

  const completedCount = roadmap.milestones.filter(m => m.status === "passed").length;
  const inProgressCount = roadmap.milestones.filter(m => m.status === "in_progress" || m.status === "exam_ready").length;
  const progressPct = Math.round((completedCount / roadmap.milestones.length) * 100);

  const stats = [
    { icon: Zap, label: "Total XP", value: progress.totalXp, color: "text-xp" },
    { icon: Flame, label: "Current Streak", value: progress.currentStreak, color: "text-streak" },
    { icon: CheckCircle2, label: "Completed", value: completedCount, color: "text-success" },
    { icon: Target, label: "In Progress", value: inProgressCount, color: "text-node-progress" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate("/roadmap")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Progress Dashboard</h1>

        {/* Overall progress */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Roadmap Progress</h2>
            <span className="text-2xl font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{completedCount} of {roadmap.milestones.length} milestones completed</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Milestones summary */}
        <h2 className="font-heading font-semibold text-foreground mb-4">Milestone History</h2>
        <div className="space-y-2">
          {roadmap.milestones.filter(m => m.status === "passed").map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground">Score: {m.examScore}% · +{m.rewardXp} XP</p>
              </div>
            </div>
          ))}
          {completedCount === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No milestones completed yet. Start learning!</p>
          )}
        </div>
      </div>
    </div>
  );
}
