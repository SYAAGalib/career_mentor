import { Roadmap } from "./store";
import { supabase } from "@/integrations/supabase/client";

export interface GeneratedExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

async function invokeAiFunction<T>(payload: Record<string, unknown>): Promise<T> {
  const providerConfig = Object.fromEntries(
    Object.entries({
      provider: import.meta.env.VITE_AI_PROVIDER,
      geminiModel: import.meta.env.VITE_GEMINI_MODEL,
      geminiFallbackModel: import.meta.env.VITE_GEMINI_FALLBACK_MODEL,
      openaiModel: import.meta.env.VITE_OPENAI_MODEL,
    }).filter(([, value]) => typeof value === "string" && value.trim().length > 0)
  );

  const { data, error } = await supabase.functions.invoke("ai-career-mentor", {
    body: {
      ...payload,
      providerConfig,
    },
  });

  if (error) {
    const errAny = error as any;
    if (errAny?.context && typeof errAny.context.json === "function") {
      try {
        const body = await errAny.context.json();
        if (body?.error && typeof body.error === "string") {
          if (body.error.includes("(429)") || body.error.toLowerCase().includes("quota")) {
            throw new Error("AI quota limit reached. Please check Gemini billing/quota and try again.");
          }
          if (body.error.includes("(503)") || body.error.toLowerCase().includes("high demand")) {
            throw new Error("AI is under high demand right now. Please retry in a few seconds.");
          }
          throw new Error(body.error);
        }
      } catch {
        // fall through to default message
      }
    }
    throw new Error(error.message || "AI service call failed.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("AI service returned invalid data.");
  }

  if ("error" in data && typeof (data as { error?: unknown }).error === "string") {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
}

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";
}

function normalizeGoal(goal: string): string {
  return goal.trim().slice(0, 200);
}

function compactText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function compactList(values: unknown, maxItems: number, maxLenPerItem: number): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => compactText(v, maxLenPerItem))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeGoalTitle(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function fallbackDetailedGoal(milestoneTitle: string, index: number): string {
  const step = index + 1;
  const safeTitle = milestoneTitle?.trim() || "this milestone";
  if (step === 1) return `Study the core concepts of ${safeTitle} and write a concise summary in your own words.`;
  if (step === 2) return `Practice ${safeTitle} with at least 3 hands-on exercises and record common mistakes.`;
  return `Apply ${safeTitle} in a mini task and document what you built, what worked, and what to improve.`;
}

function normalizeMilestoneGoals(rawGoals: unknown, milestoneTitle: string): { title: string }[] {
  const items = Array.isArray(rawGoals) ? rawGoals : [];

  const normalized = items
    .map((raw) => {
      if (typeof raw === "string") {
        return normalizeGoalTitle(raw);
      }

      if (raw && typeof raw === "object") {
        const g = raw as {
          title?: unknown;
          goal?: unknown;
          task?: unknown;
          action?: unknown;
          howTo?: unknown;
          outcome?: unknown;
        };

        const base =
          normalizeGoalTitle(g.title) ||
          normalizeGoalTitle(g.goal) ||
          normalizeGoalTitle(g.task) ||
          normalizeGoalTitle(g.action);
        const howTo = normalizeGoalTitle(g.howTo);
        const outcome = normalizeGoalTitle(g.outcome);

        const details = [howTo, outcome].filter(Boolean).join(" ");
        return normalizeGoalTitle(`${base}${details ? ` ${details}` : ""}`);
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 4);

  if (normalized.length >= 2) {
    return normalized.map((title) => ({ title }));
  }

  const detailedFallbacks = [
    fallbackDetailedGoal(milestoneTitle, 0),
    fallbackDetailedGoal(milestoneTitle, 1),
    fallbackDetailedGoal(milestoneTitle, 2),
  ];

  const merged = [...normalized, ...detailedFallbacks].slice(0, 3);
  return merged.map((title) => ({ title }));
}

function normalizeAnswers(answers: Record<string, string>): Record<string, string> {
  const allowedKeys = [
    "level",
    "hours",
    "pace",
    "outcome",
    "deadline",
    "background",
    "strengths",
    "weakAreas",
    "learningStyle",
    "resources",
    "targetRole",
  ];
  const result: Record<string, string> = {};
  for (const key of allowedKeys) {
    const value = answers[key];
    if (typeof value === "string" && value.trim()) {
      const maxLen = key === "background" || key === "resources" || key === "weakAreas" ? 220 : 140;
      result[key] = value.trim().slice(0, maxLen);
    }
  }
  return result;
}

export async function generateAiRoadmap(params: {
  goal: string;
  answers: Record<string, string>;
}): Promise<Roadmap> {
  const goal = normalizeGoal(params.goal);
  const answers = normalizeAnswers(params.answers);

  const data = await invokeAiFunction<{
    title: string;
    goalSummary: string;
    estimatedDuration: string;
    sections: { title: string; description: string; orderIndex: number }[];
    milestones: {
      sectionTitle: string;
      title: string;
      description: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      estimatedTime: string;
      rewardXp: number;
      goals: { title: string }[];
      dependsOnTitles?: string[];
      isFinal?: boolean;
      orderIndex: number;
    }[];
  }>({
    action: "roadmap",
    goal,
    answers,
  });

  const sections = (data.sections || [])
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((s, i) => ({
      id: `s${i + 1}`,
      title: s.title,
      description: s.description,
      orderIndex: i,
    }));

  const sectionByTitle = new Map(sections.map((s) => [s.title.toLowerCase(), s.id]));

  const rawMilestones = (data.milestones || []).sort((a, b) => a.orderIndex - b.orderIndex);
  const milestoneIdByTitle = new Map<string, string>();

  rawMilestones.forEach((m, i) => {
    milestoneIdByTitle.set(m.title.toLowerCase(), `m${i + 1}_${slug(m.title)}`);
  });

  const milestones = rawMilestones.map((m, i) => {
    const sectionId = sectionByTitle.get(m.sectionTitle.toLowerCase()) || sections[0]?.id || "s1";
    const id = milestoneIdByTitle.get(m.title.toLowerCase()) || `m${i + 1}`;
    const dependsOn = (m.dependsOnTitles || [])
      .map((t) => milestoneIdByTitle.get(t.toLowerCase()))
      .filter((v): v is string => Boolean(v));
    const normalizedGoals = normalizeMilestoneGoals(m.goals, m.title);

    return {
      id,
      sectionId,
      title: m.title,
      description: m.description,
      difficulty: m.difficulty,
      estimatedTime: m.estimatedTime,
      rewardXp: Math.max(20, Math.min(300, Math.round(m.rewardXp || 60))),
      goals: normalizedGoals.map((g, gi) => ({
        id: `g${i + 1}_${gi + 1}`,
        title: g.title,
        completed: false,
      })),
      status: dependsOn.length === 0 ? ("unlocked" as const) : ("locked" as const),
      dependsOn,
      parallelWith: [],
      orderIndex: i,
      isFinal: Boolean(m.isFinal),
    };
  });

  if (!milestones.some((m) => m.isFinal) && milestones.length > 0) {
    milestones[milestones.length - 1].isFinal = true;
  }

  return {
    id: `roadmap_${Date.now()}`,
    title: data.title || `${goal} Roadmap`,
    goalSummary: data.goalSummary || goal,
    estimatedDuration: data.estimatedDuration || "Custom",
    sections,
    milestones,
    createdAt: new Date().toISOString(),
  };
}

export async function generateAiExamQuestions(params: {
  milestoneTitle: string;
  milestoneDescription: string;
  goalSummary: string;
  userQuestions: string[];
}): Promise<GeneratedExamQuestion[]> {
  const milestoneTitle = compactText(params.milestoneTitle, 120);
  const milestoneDescription = compactText(params.milestoneDescription, 260);
  const goalSummary = compactText(params.goalSummary, 220);
  const userQuestions = compactList(params.userQuestions, 6, 140);

  const data = await invokeAiFunction<{ questions: GeneratedExamQuestion[] }>({
    action: "exam",
    milestoneTitle,
    milestoneDescription,
    goalSummary,
    userQuestions,
  });

  const qs = Array.isArray(data.questions) ? data.questions : [];
  const cleaned = qs.slice(0, 10).map((q, i) => ({
    id: q.id || `q${i + 1}`,
    question: q.question,
    options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
    correctIndex:
      typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex <= 3
        ? q.correctIndex
        : 0,
  }));

  if (cleaned.length !== 10 || cleaned.some((q) => q.options.length !== 4 || !q.question)) {
    throw new Error("AI returned an invalid exam format.");
  }

  return cleaned;
}

export async function generateAiMentorReply(params: {
  milestoneTitle: string;
  milestoneDescription: string;
  goalSummary: string;
  goals: string[];
  chatHistory: { role: string; content: string }[];
  userMessage: string;
}): Promise<string> {
  const milestoneTitle = compactText(params.milestoneTitle, 120);
  const milestoneDescription = compactText(params.milestoneDescription, 240);
  const goalSummary = compactText(params.goalSummary, 220);
  const goals = compactList(params.goals, 4, 140);
  const chatHistory = (Array.isArray(params.chatHistory) ? params.chatHistory : [])
    .slice(-6)
    .map((m) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: compactText(m?.content, 220),
    }))
    .filter((m) => m.content.length > 0);
  const userMessage = compactText(params.userMessage, 320);

  const data = await invokeAiFunction<{ reply: string }>({
    action: "mentor",
    milestoneTitle,
    milestoneDescription,
    goalSummary,
    goals,
    chatHistory,
    userMessage,
  });

  if (!data.reply?.trim()) {
    throw new Error("AI returned an empty mentor response.");
  }

  return data.reply.trim();
}
