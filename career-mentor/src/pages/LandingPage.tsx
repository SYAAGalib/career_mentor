import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Map, Brain, Trophy, MessageSquare, Sparkles, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";

const features = [
  { icon: Brain, title: "AI-Generated Roadmaps", desc: "Tell us your goal, get a personalized learning path" },
  { icon: Map, title: "Milestone-Based Learning", desc: "Clear steps with small goals inside each milestone" },
  { icon: Trophy, title: "Gamified Progress", desc: "Earn XP, badges, and streaks as you learn" },
  { icon: MessageSquare, title: "AI Mentor Chat", desc: "Get help from AI tutor inside every milestone" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">CareerMentor</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="w-4 h-4" />
          </Button>
          {state.onboardingComplete && (
            <Button size="sm" onClick={() => navigate("/roadmap")} className="gradient-primary text-primary-foreground">
              My Roadmap
            </Button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Learning Roadmaps
          </div>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Your personalized
            <span className="block gradient-primary bg-clip-text text-transparent">learning journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Tell CareerMentor what you want to learn. AI builds a custom roadmap with milestones, quizzes, and mentorship — so you always know what to do next.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={() => navigate(state.onboardingComplete ? "/roadmap" : "/onboarding")}
              className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-xl glow-primary"
            >
              {state.onboardingComplete ? "Continue Learning" : "Build My Roadmap"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-24">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
