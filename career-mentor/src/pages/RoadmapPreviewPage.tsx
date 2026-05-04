import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen, Target, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";

export default function RoadmapPreviewPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const roadmap = state.roadmap;

  if (!roadmap) {
    navigate("/onboarding");
    return null;
  }

  const totalMilestones = roadmap.milestones.length;
  const totalGoals = roadmap.milestones.reduce((a, m) => a + m.goals.length, 0);
  const totalXp = roadmap.milestones.reduce((a, m) => a + m.rewardXp, 0);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary"
          >
            <Target className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{roadmap.title}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your personalized roadmap is ready. Here's an overview of your learning journey.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Layers, label: "Sections", value: roadmap.sections.length },
              { icon: BookOpen, label: "Milestones", value: totalMilestones },
              { icon: Target, label: "Goals", value: totalGoals },
              { icon: Clock, label: "Duration", value: roadmap.estimatedDuration },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-heading font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections preview */}
        <div className="space-y-3 mb-8">
          {roadmap.sections.map((section, i) => {
            const sectionMilestones = roadmap.milestones.filter(m => m.sectionId === section.id);
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{sectionMilestones.length} milestones · {sectionMilestones.reduce((a, m) => a + m.rewardXp, 0)} XP</p>
                  </div>
                  <div className="flex gap-1">
                    {sectionMilestones.map(m => (
                      <div key={m.id} className="w-2.5 h-2.5 rounded-full bg-primary/30" />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/onboarding")} className="flex-1 border-border text-muted-foreground">
            <RotateCcw className="w-4 h-4 mr-2" /> Refine
          </Button>
          <Button onClick={() => navigate("/roadmap")} className="flex-1 gradient-primary text-primary-foreground h-12 text-base">
            Start Learning <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
