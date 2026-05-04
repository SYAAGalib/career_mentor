import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Zap, MessageSquare, FileQuestion, Clock, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/AppContext";
import { cn } from "@/lib/utils";
import { generateAiMentorReply } from "@/lib/ai";

export default function MilestonePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, completeGoal, addChatMessage } = useApp();
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const milestone = state.roadmap?.milestones.find(m => m.id === id);
  if (!milestone) {
    navigate("/roadmap");
    return null;
  }

  const goalsDone = milestone.goals.filter(g => g.completed).length;
  const allGoalsDone = goalsDone === milestone.goals.length;
  const chatMessages = state.chatHistory[milestone.id] || [];

  const getGoalLabel = (title: string, index: number) => {
    const cleaned = title?.trim();
    if (cleaned) return cleaned;
    if (index === 0) return `Read and summarize the key concepts for ${milestone.title}.`;
    if (index === 1) return `Practice ${milestone.title} with hands-on exercises.`;
    return `Complete a mini implementation task for ${milestone.title}.`;
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    addChatMessage(milestone.id, "user", userMessage);
    setChatInput("");

    setChatLoading(true);
    try {
      const response = await generateAiMentorReply({
        milestoneTitle: milestone.title,
        milestoneDescription: milestone.description,
        goalSummary: state.roadmap?.goalSummary || "",
        goals: milestone.goals.map(g => g.title),
        chatHistory: [...chatMessages, { role: "user", content: userMessage }],
        userMessage,
      });
      addChatMessage(milestone.id, "assistant", response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI mentor response failed.";
      addChatMessage(milestone.id, "assistant", `I couldn't generate a response right now: ${message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const promptChips = [
    "Explain this topic simply",
    "Give me examples",
    "Quiz me before exam",
    "Summarize the topic",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <button onClick={() => navigate("/roadmap")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Roadmap
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-foreground">{milestone.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                "uppercase tracking-wider font-medium",
                milestone.difficulty === "beginner" ? "text-success" : milestone.difficulty === "intermediate" ? "text-warning" : "text-destructive"
              )}>{milestone.difficulty}</span>
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{milestone.estimatedTime}</span>
              <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-xp" />{milestone.rewardXp} XP</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)} className="border-border">
              <MessageSquare className="w-4 h-4 mr-1" /> AI Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-6">
        {/* Main content */}
        <div className={cn("flex-1 min-w-0", showChat && "hidden md:block")}>
          <p className="text-muted-foreground mb-6">{milestone.description}</p>

          {/* Goals */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-foreground">Goals</h2>
              <span className="text-xs text-muted-foreground">{goalsDone}/{milestone.goals.length} completed</span>
            </div>
            <div className="space-y-2">
              {milestone.goals.map((goal, index) => (
                <motion.button
                  key={goal.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !goal.completed && completeGoal(milestone.id, goal.id)}
                  disabled={goal.completed}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                    goal.completed
                      ? "border-node-passed/30 bg-node-passed/5"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  {goal.completed
                    ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  }
                  <span className={cn("text-sm", goal.completed ? "text-muted-foreground line-through" : "text-foreground")}>
                    {getGoalLabel(goal.title, index)}
                  </span>
                  {!goal.completed && (
                    <span className="ml-auto text-[10px] text-primary font-medium">+10 XP</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary"
                animate={{ width: `${(goalsDone / milestone.goals.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Exam button */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileQuestion className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Milestone Exam</h3>
                <p className="text-xs text-muted-foreground">10 questions · 80% to pass · +{milestone.rewardXp} XP</p>
              </div>
            </div>
            {milestone.examScore !== undefined && (
              <p className={cn("text-sm mb-3", milestone.examScore >= 80 ? "text-success" : "text-destructive")}>
                Last attempt: {milestone.examScore}% {milestone.examScore >= 80 ? "✓ Passed" : "✗ Failed"}
              </p>
            )}
            <Button
              onClick={() => navigate(`/exam/${milestone.id}`)}
              disabled={!allGoalsDone && milestone.status !== "exam_ready" && milestone.status !== "passed"}
              className={cn(
                "w-full",
                allGoalsDone || milestone.status === "exam_ready" || milestone.status === "passed"
                  ? "gradient-primary text-primary-foreground"
                  : ""
              )}
            >
              {milestone.status === "passed" ? "Retake Exam" : allGoalsDone ? "Take Exam" : "Complete all goals first"}
            </Button>
          </div>
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-96 flex flex-col bg-card border border-border rounded-xl overflow-hidden"
            style={{ height: "calc(100vh - 140px)" }}
          >
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="font-heading font-semibold text-sm text-foreground">AI Mentor</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{milestone.title}</span>
              <button onClick={() => setShowChat(false)} className="md:hidden text-muted-foreground text-xs">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">Ask me anything about <span className="text-foreground font-medium">{milestone.title}</span></p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {promptChips.map(chip => (
                      <button
                        key={chip}
                        onClick={() => { setChatInput(chip); }}
                        className="px-2.5 py-1 rounded-full text-xs border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "")}>
                  {msg.role === "assistant" && <Bot className="w-5 h-5 text-primary shrink-0 mt-1" />}
                  <div className={cn(
                    "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && <User className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about this topic..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendChat()}
                  disabled={chatLoading}
                  className="h-9 text-sm bg-background border-border"
                />
                <Button size="icon" onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading} className="h-9 w-9 gradient-primary text-primary-foreground shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              {chatLoading && (
                <p className="text-[10px] text-muted-foreground mt-2">AI mentor is thinking...</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
