import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import { generateAiExamQuestions, GeneratedExamQuestion } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { fireExamPassConfetti } from "@/lib/confetti";
import { toast } from "sonner";

export default function ExamPage() {
  const { milestoneId } = useParams<{ milestoneId: string }>();
  const navigate = useNavigate();
  const { state, submitExam } = useApp();
  const milestone = state.roadmap?.milestones.find(m => m.id === milestoneId);

  const [questions, setQuestions] = useState<GeneratedExamQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = Object.keys(answers).length === questions.length;
  const score = submitted
    ? Math.round(questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0) / Math.max(questions.length, 1) * 100)
    : 0;
  const passed = score >= 80;

  const loadQuestions = useCallback(async () => {
    if (!milestone || !state.roadmap) return;

    setLoadingQuestions(true);
    setQuestionError("");
    setSubmitted(false);
    setCurrentQ(0);
    setAnswers({});

    try {
      const userQuestions = (state.chatHistory[milestone.id] || [])
        .filter(m => m.role === "user")
        .map(m => m.content);

      const generated = await generateAiExamQuestions({
        milestoneTitle: milestone.title,
        milestoneDescription: milestone.description,
        goalSummary: state.roadmap.goalSummary,
        userQuestions,
      });

      setQuestions(generated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate exam questions.";
      setQuestionError(message);
      toast.error(message);
    } finally {
      setLoadingQuestions(false);
    }
  }, [milestone, state.chatHistory, state.roadmap]);

  useEffect(() => {
    if (submitted && passed) {
      fireExamPassConfetti();
    }
  }, [submitted, passed]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  if (!milestone) {
    navigate("/roadmap");
    return null;
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Generating AI exam...</h1>
          <p className="text-muted-foreground text-sm">Creating fresh questions for this milestone.</p>
        </div>
      </div>
    );
  }

  if (questionError || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Cannot generate exam</h1>
          <p className="text-muted-foreground text-sm mb-6">{questionError || "No questions were generated."}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/milestone/${milestone.id}`)} className="flex-1 border-border">
              Back to Milestone
            </Button>
            <Button onClick={loadQuestions} className="flex-1 gradient-primary text-primary-foreground">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = (optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleSubmit = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const s = Math.round((correct / questions.length) * 100);
    submitExam(milestone.id, s, {
      questions: questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: answers[i],
      })),
    });
    setSubmitted(true);
  };

  if (submitted) {
    const isFinalExam = milestone.isFinal;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          {passed ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 glow-success"
              >
                <CheckCircle2 className="w-10 h-10 text-success" />
              </motion.div>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                {isFinalExam ? "Roadmap Complete! 🎓" : "Milestone Passed! 🎉"}
              </h1>
              <p className="text-muted-foreground mb-2">You scored <span className="text-success font-bold">{score}%</span></p>
              <p className="text-sm text-xp font-medium mb-2">+{milestone.rewardXp} XP earned!</p>
              {isFinalExam && (
                <p className="text-sm text-primary font-medium mb-6">🎓 You've unlocked your digital certificate!</p>
              )}
              <div className="mb-8" />
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Not quite yet</h1>
              <p className="text-muted-foreground mb-2">You scored <span className="text-destructive font-bold">{score}%</span></p>
              <p className="text-sm text-muted-foreground mb-8">You need 80% to pass. Review and try again!</p>
            </>
          )}
          <div className="flex gap-3">
            {passed && isFinalExam ? (
              <>
                <Button variant="outline" onClick={() => navigate("/roadmap")} className="flex-1 border-border">
                  Back to Roadmap
                </Button>
                <Button onClick={() => navigate("/certificate")} className="flex-1 gradient-accent text-accent-foreground">
                  Get Certificate <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate(`/milestone/${milestone.id}`)} className="flex-1 border-border">
                  {passed ? "View Milestone" : "Review & Study"}
                </Button>
                <Button onClick={() => navigate("/roadmap")} className="flex-1 gradient-primary text-primary-foreground">
                  {passed ? "Next Milestone" : "Back to Roadmap"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <button onClick={() => navigate(`/milestone/${milestone.id}`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-4 h-4" /> Exit Exam
        </button>
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-bold text-foreground text-sm">{milestone.title} — Exam</h1>
          <span className="text-xs text-muted-foreground">Pass: 80%</span>
        </div>
        <div className="h-1 bg-muted rounded-full mt-2">
          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</p>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-6">{q.question}</h2>
            <div className="space-y-3 mb-8">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-xl border transition-all text-sm",
                    answers[currentQ] === oi
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  )}
                >
                  <span className="text-muted-foreground mr-2">{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {currentQ > 0 && (
                <Button variant="outline" onClick={() => setCurrentQ(currentQ - 1)} className="border-border">
                  Previous
                </Button>
              )}
              {currentQ < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={answers[currentQ] === undefined} className="ml-auto gradient-primary text-primary-foreground">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!allAnswered} className="ml-auto gradient-primary text-primary-foreground">
                  Submit Exam
                </Button>
              )}
            </div>

            <div className="flex justify-center gap-1.5 mt-8">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    i === currentQ ? "bg-primary scale-125" :
                    answers[i] !== undefined ? "bg-primary/40" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
