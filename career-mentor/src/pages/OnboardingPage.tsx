import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/AppContext";
import { generateAiRoadmap } from "@/lib/ai";
import { toast } from "sonner";

const coreQuestions = [
  { id: "level", text: "What's your current experience level?" },
  { id: "hours", text: "How many hours per week can you study?" },
  { id: "pace", text: "How quickly do you want to progress?" },
  { id: "outcome", text: "What's your target outcome?" },
];

const additionalQuestions = [
  { id: "deadline", text: "Do you have a deadline? (date or timeframe)" },
  { id: "background", text: "What related skills or tools do you already know?" },
  { id: "strengths", text: "What are your strengths as a learner?" },
  { id: "weakAreas", text: "What usually blocks your progress?" },
  { id: "learningStyle", text: "How do you learn best? (videos, projects, docs, mentorship)" },
  { id: "resources", text: "What resources do you have? (laptop quality, internet, budget, courses)" },
  { id: "targetRole", text: "What exact role or project do you want to achieve?" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setRoadmap } = useApp();
  const [goal, setGoal] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const suggestions = [
    "Become a frontend developer",
    "Learn data science",
    "Become a UI/UX designer",
    "Learn Python programming",
  ];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const completedCoreCount = coreQuestions.filter((q) => (answers[q.id] || "").trim().length > 0).length;
  const requiredReady = goal.trim().length > 0 && completedCoreCount === coreQuestions.length;
  const progress = Math.round((completedCoreCount / coreQuestions.length) * 100);

  const handleGenerate = async () => {
    if (generating || !requiredReady) return;

    setGenerating(true);

    try {
      const roadmap = await generateAiRoadmap({
        goal: goal.trim(),
        answers,
      });
      setRoadmap(roadmap);
      navigate("/roadmap-preview");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate roadmap.";
      toast.error(message);
      setGenerating(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div className="h-full gradient-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Build your personalized roadmap</h2>
              <p className="text-muted-foreground">Answer the form once. AI will generate a roadmap tailored to your goals, pace, and constraints.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Learning goal <span className="text-destructive">*</span></label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Become a frontend developer"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="h-12 bg-card border-border pr-12"
                  />
                  <Send className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => setGoal(s)}
                      className="px-3 py-1.5 rounded-full text-sm border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h3 className="font-heading font-semibold text-foreground">Core questions (required)</h3>
                <p className="text-xs text-muted-foreground">These 4 answers are mandatory before generating your roadmap.</p>
                {coreQuestions.map((question, index) => (
                  <div key={question.id}>
                    <label className="text-sm text-foreground mb-2 block">
                      {index + 1}. {question.text} <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Write a specific answer..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="min-h-24 bg-background border-border"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <h3 className="font-heading font-semibold text-foreground">Additional personalization (optional but recommended)</h3>
                {additionalQuestions.map((question, index) => (
                  <div key={question.id}>
                    <label className="text-sm text-foreground mb-2 block">
                      {index + 5}. {question.text}
                    </label>
                    <Textarea
                      placeholder="Add details to make your roadmap more precise..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="min-h-20 bg-background border-border"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!requiredReady || generating}
                className="w-full gradient-primary text-primary-foreground h-12 text-base"
              >
                {generating ? "Generating your roadmap..." : "Generate My Personalized Roadmap"}
                {!generating && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {!requiredReady && (
                <p className="text-xs text-muted-foreground text-center">
                  Complete your learning goal and all 4 core questions to continue.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
