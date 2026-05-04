import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Star, Trophy, Flame, Zap, Lock, GraduationCap } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { cn } from "@/lib/utils";
import { fireBadgeConfetti } from "@/lib/confetti";

const allBadges = [
  { id: "First Milestone", name: "First Milestone", desc: "Complete your first milestone", icon: Star, color: "text-xp" },
  { id: "Five Down", name: "Five Down", desc: "Complete 5 milestones", icon: Trophy, color: "text-success" },
  { id: "Streak 3", name: "On Fire", desc: "Maintain a 3-day streak", icon: Flame, color: "text-streak" },
  { id: "XP 500", name: "XP Master", desc: "Earn 500 XP", icon: Zap, color: "text-xp" },
  { id: "Perfectionist", name: "Perfectionist", desc: "Score 100% on an exam", icon: Award, color: "text-badge" },
];

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const earnedBadges = state.progress.badges;
  const prevCount = useRef(earnedBadges.length);

  useEffect(() => {
    if (earnedBadges.length > prevCount.current) {
      fireBadgeConfetti();
    }
    prevCount.current = earnedBadges.length;
  }, [earnedBadges.length]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate("/roadmap")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Achievements</h1>
        <p className="text-muted-foreground mb-8">{earnedBadges.length} of {allBadges.length} badges earned</p>

        {/* Certificate section */}
        {state.certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Certificates
            </h2>
            <div className="space-y-3">
              {state.certificates.map(cert => (
                <button
                  key={cert.id}
                  onClick={() => navigate("/certificate")}
                  className="w-full bg-card border border-primary/30 rounded-xl p-4 flex items-center gap-4 hover:border-primary/60 transition-all glow-primary text-left"
                >
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground truncate">{cert.roadmapTitle}</h3>
                    <p className="text-xs text-muted-foreground">Issued to {cert.holderName} • Score: {cert.finalExamScore}%</p>
                  </div>
                  <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allBadges.map((badge, i) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative bg-card border rounded-xl p-5 transition-all",
                  earned ? "border-primary/40 glow-primary" : "border-border opacity-50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    earned ? "bg-primary/10" : "bg-muted"
                  )}>
                    {earned ? <badge.icon className={cn("w-6 h-6", badge.color)} /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    {earned && <span className="text-[10px] text-primary font-medium mt-1 inline-block">✓ Earned</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
