declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ENV_OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
const ENV_OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const ENV_GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const ENV_GEMINI_FALLBACK_MODEL = Deno.env.get("GEMINI_FALLBACK_MODEL") || "gemini-1.5-flash";
const ENV_GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const ENV_AI_PROVIDER = (Deno.env.get("AI_PROVIDER") || (ENV_GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();

type ChatMessage = { role: "system" | "user"; content: string };
type ProviderConfig = {
  provider?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  geminiFallbackModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
};
type AiOptions = {
  temperature?: number;
  maxOutputTokens?: number;
};

type RoadmapPayload = {
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
};

function asDifficulty(v: unknown): "beginner" | "intermediate" | "advanced" {
  const s = compactText(v, 20).toLowerCase();
  if (s === "beginner" || s === "intermediate" || s === "advanced") return s;
  return "intermediate";
}

function parseRoadmapPayload(raw: unknown, goal: string): RoadmapPayload {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const rawSections = Array.isArray(data.sections)
    ? data.sections
    : Array.isArray(data.se)
    ? data.se
    : [];

  const rawMilestones = Array.isArray(data.milestones)
    ? data.milestones
    : Array.isArray(data.mi)
    ? data.mi
    : [];

  const sections = rawSections.slice(0, 8).map((s, i) => {
    const o = s && typeof s === "object" ? (s as Record<string, unknown>) : {};
    const title = compactText(o.title ?? o.t, 80) || `Section ${i + 1}`;
    const description = compactText(o.description ?? o.d, 160) || "Learning section";
    const order = Number(o.orderIndex ?? o.o);
    return {
      title,
      description,
      orderIndex: Number.isFinite(order) ? order : i,
    };
  });

  const sectionTitles = new Set(sections.map((s) => s.title));

  const milestones = rawMilestones.slice(0, 14).map((m, i) => {
    const o = m && typeof m === "object" ? (m as Record<string, unknown>) : {};
    const sectionTitleCandidate = compactText(o.sectionTitle ?? o.s, 80);
    const sectionTitle = sectionTitles.has(sectionTitleCandidate)
      ? sectionTitleCandidate
      : sections[0]?.title || "Foundations";

    const title = compactText(o.title ?? o.t, 120) || `Milestone ${i + 1}`;
    const description = compactText(o.description ?? o.d, 240) || `Learn and apply ${title}.`;
    const estimatedTime = compactText(o.estimatedTime ?? o.et, 40) || "1 week";
    const rewardNum = Number(o.rewardXp ?? o.xp);
    const rewardXp = Number.isFinite(rewardNum) ? Math.max(40, Math.min(220, Math.round(rewardNum))) : 80;
    const orderNum = Number(o.orderIndex ?? o.o);
    const orderIndex = Number.isFinite(orderNum) ? orderNum : i;

    const rawGoals = Array.isArray(o.goals)
      ? o.goals
      : Array.isArray(o.g)
      ? o.g
      : [];
    const goals = rawGoals
      .slice(0, 4)
      .map((g) => {
        if (typeof g === "string") return compactText(g, 220);
        if (g && typeof g === "object") {
          const gg = g as Record<string, unknown>;
          return compactText(gg.title ?? gg.t, 220);
        }
        return "";
      })
      .filter(Boolean)
      .map((title) => ({ title }));

    const rawDepends = Array.isArray(o.dependsOnTitles)
      ? o.dependsOnTitles
      : Array.isArray(o.dep)
      ? o.dep
      : [];
    const dependsOnTitles = rawDepends.map((d) => compactText(d, 120)).filter(Boolean);

    return {
      sectionTitle,
      title,
      description,
      difficulty: asDifficulty(o.difficulty ?? o.lv),
      estimatedTime,
      rewardXp,
      goals,
      dependsOnTitles,
      isFinal: Boolean(o.isFinal ?? o.f),
      orderIndex,
    };
  });

  if (sections.length < 3 || milestones.length < 5) {
    throw new Error("AI returned insufficient roadmap structure.");
  }

  return {
    title: compactText(data.title ?? data.t, 120) || `${goal} Personalized Roadmap`,
    goalSummary: compactText(data.goalSummary ?? data.gs, 320) || `Personalized plan for ${goal}`,
    estimatedDuration: compactText(data.estimatedDuration ?? data.d, 60) || "Custom",
    sections,
    milestones,
  };
}

function parseExamPayload(raw: unknown): { questions: { id: string; question: string; options: string[]; correctIndex: number }[] } {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const source = Array.isArray(data.questions)
    ? data.questions
    : Array.isArray(data.q)
    ? data.q
    : [];

  const questions = source
    .slice(0, 10)
    .map((item, i) => {
      const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const question = compactText(o.question ?? o.q, 240);
      const rawOptions = Array.isArray(o.options)
        ? o.options
        : Array.isArray(o.o)
        ? o.o
        : [];
      const options = rawOptions.map((v) => compactText(v, 120)).filter(Boolean).slice(0, 4);
      const answer = Number(o.correctIndex ?? o.a);
      const correctIndex = Number.isFinite(answer) ? Math.max(0, Math.min(3, Math.round(answer))) : 0;
      return {
        id: `q${i + 1}`,
        question,
        options,
        correctIndex,
      };
    })
    .filter((q) => q.question.length > 0 && q.options.length === 4);

  if (questions.length !== 10) {
    throw new Error("AI returned invalid exam format.");
  }

  return { questions };
}

function compactText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function compactList(value: unknown, maxItems: number, maxLenPerItem: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => compactText(v, maxLenPerItem))
    .filter(Boolean)
    .slice(0, maxItems);
}

function fallbackRoadmap(goal: string, answers: Record<string, string>) {
  const level = (answers.level || "Some Knowledge").toLowerCase();
  const hours = answers.hours || "4-7 hours";
  const pace = answers.pace || "Steady pace";
  const outcome = answers.outcome || "Career change";
  const targetRole = answers.targetRole || "";
  const deadline = answers.deadline || "";

  const beginner = level.includes("beginner") || level.includes("complete");
  const title = `${goal} Personalized Roadmap`;
  const estimatedDuration = beginner ? "4-8 months" : "2-5 months";

  return {
    title,
    goalSummary: `Personalized plan for ${goal}. Level: ${answers.level || "N/A"}; Time: ${hours}; Pace: ${pace}; Outcome: ${outcome}${targetRole ? `; Target role/project: ${targetRole}` : ""}${deadline ? `; Deadline: ${deadline}` : ""}.`,
    estimatedDuration,
    sections: [
      { title: "Foundations", description: "Core concepts and setup", orderIndex: 0 },
      { title: "Core Skills", description: "Hands-on practical learning", orderIndex: 1 },
      { title: "Projects", description: "Portfolio and real-world practice", orderIndex: 2 },
      { title: "Interview / Career", description: "Job readiness and final assessment", orderIndex: 3 },
    ],
    milestones: [
      {
        sectionTitle: "Foundations",
        title: beginner ? "Beginner Setup & Basics" : "Skill Gap Assessment",
        description: "Set up tools and align the learning path to your current level.",
        difficulty: "beginner" as const,
        estimatedTime: "1 week",
        rewardXp: 50,
        goals: [
          { title: "Install and configure all required tools, then verify with a simple working setup." },
          { title: "Map your current strengths and gaps against the roadmap topics in a short checklist." },
          { title: "Complete one baseline exercise and write what was easy vs. difficult." },
        ],
        dependsOnTitles: [],
        orderIndex: 0,
      },
      {
        sectionTitle: "Core Skills",
        title: "Core Concept Mastery",
        description: `Master the essential concepts for ${goal}.`,
        difficulty: beginner ? ("beginner" as const) : ("intermediate" as const),
        estimatedTime: "2 weeks",
        rewardXp: 70,
        goals: [
          { title: "Study the key concepts with notes and create a one-page summary in your own words." },
          { title: "Solve at least 5 guided exercises and track recurring mistakes." },
          { title: "Explain the concepts to yourself (or a peer) using one practical example." },
        ],
        dependsOnTitles: [beginner ? "Beginner Setup & Basics" : "Skill Gap Assessment"],
        orderIndex: 1,
      },
      {
        sectionTitle: "Core Skills",
        title: "Applied Practice",
        description: "Apply core concepts through focused tasks.",
        difficulty: "intermediate" as const,
        estimatedTime: "2 weeks",
        rewardXp: 80,
        goals: [
          { title: "Complete 3 mini tasks that each use a different core concept." },
          { title: "Review errors from those tasks and document fixes." },
          { title: "Refactor one task for better performance, readability, or reliability." },
        ],
        dependsOnTitles: ["Core Concept Mastery"],
        orderIndex: 2,
      },
      {
        sectionTitle: "Projects",
        title: "Project 1 (Guided)",
        description: "Build a guided project and document your approach.",
        difficulty: "intermediate" as const,
        estimatedTime: "2 weeks",
        rewardXp: 100,
        goals: [
          { title: "Define project scope, deliverables, and a weekly implementation plan." },
          { title: "Implement core features and test each feature with clear acceptance checks." },
          { title: "Write project documentation with setup, architecture, and lessons learned." },
        ],
        dependsOnTitles: ["Applied Practice"],
        orderIndex: 3,
      },
      {
        sectionTitle: "Projects",
        title: "Project 2 (Independent)",
        description: "Build an independent project aligned with your target outcome.",
        difficulty: "advanced" as const,
        estimatedTime: "2-3 weeks",
        rewardXp: 130,
        goals: [
          { title: "Define success metrics and measurable project milestones before coding." },
          { title: "Build an independent project and iterate based on self-review feedback." },
          { title: "Prepare a polished showcase with demo, README, and key technical decisions." },
        ],
        dependsOnTitles: ["Project 1 (Guided)"],
        orderIndex: 4,
      },
      {
        sectionTitle: "Interview / Career",
        title: `Final Exam — ${goal}`,
        description: "Comprehensive evaluation and readiness check.",
        difficulty: "advanced" as const,
        estimatedTime: "1 day",
        rewardXp: 200,
        goals: [
          { title: "Review all modules using your own notes and fix remaining weak areas." },
          { title: "Take the final assessment and analyze incorrect answers for improvement." },
        ],
        dependsOnTitles: ["Project 2 (Independent)"],
        isFinal: true,
        orderIndex: 5,
      },
    ],
    _source: "fallback",
  };
}

async function callOpenAIJson<T>(messages: ChatMessage[], config: ProviderConfig, options: AiOptions = {}): Promise<T> {
  const OPENAI_API_KEY = config.openaiApiKey || ENV_OPENAI_API_KEY;
  const OPENAI_MODEL = config.openaiModel || ENV_OPENAI_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxOutputTokens = options.maxOutputTokens ?? 800;

  if (!OPENAI_API_KEY) {
    throw new Error("Server AI key is not configured. Set OPENAI_API_KEY secret.");
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature,
      max_tokens: maxOutputTokens,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${text}`);
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned empty response.");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }
}

async function callGeminiJson<T>(messages: ChatMessage[], config: ProviderConfig, options: AiOptions = {}): Promise<T> {
  const GEMINI_API_KEY = config.geminiApiKey || ENV_GEMINI_API_KEY;
  const GEMINI_MODEL = config.geminiModel || ENV_GEMINI_MODEL;
  const GEMINI_FALLBACK_MODEL = config.geminiFallbackModel || ENV_GEMINI_FALLBACK_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxOutputTokens = options.maxOutputTokens ?? 800;

  if (!GEMINI_API_KEY) {
    throw new Error("Server AI key is not configured. Set GEMINI_API_KEY secret.");
  }

  const systemText = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n");
  const prompt = `${systemText}\n\n${userText}`.trim();

  const callModel = async (model: string) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      const isRetryable = res.status === 429 || res.status === 503;
      const err = new Error(`Gemini error (${res.status}): ${text}`) as Error & { retryable?: boolean };
      err.retryable = isRetryable;
      throw err;
    }

    const payload = await res.json();
    const parts = payload?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? parts
          .map((p: { text?: string }) => p?.text || "")
          .join("")
          .trim()
      : "";

    if (!text) {
      throw new Error("Gemini returned empty response.");
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }
  };

  const tryWithRetry = async (model: string) => {
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callModel(model);
      } catch (e) {
        lastErr = e as Error & { retryable?: boolean };
        const retryable = (lastErr as Error & { retryable?: boolean }).retryable;
        if (!retryable || attempt === 2) break;
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
    throw lastErr || new Error("Gemini request failed.");
  };

  try {
    return await tryWithRetry(GEMINI_MODEL);
  } catch (primaryErr) {
    if (GEMINI_FALLBACK_MODEL && GEMINI_FALLBACK_MODEL !== GEMINI_MODEL) {
      try {
        return await tryWithRetry(GEMINI_FALLBACK_MODEL);
      } catch (_fallbackErr) {
        // Fall through to throw primary error
      }
    }
    throw primaryErr;
  }
}

async function callAiJson<T>(messages: ChatMessage[], config: ProviderConfig, options: AiOptions = {}): Promise<T> {
  const AI_PROVIDER = (config.provider || ENV_AI_PROVIDER).toLowerCase();
  if (AI_PROVIDER === "gemini") {
    return callGeminiJson<T>(messages, config, options);
  }
  return callOpenAIJson<T>(messages, config, options);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const cfg = body?.providerConfig;
    const runtimeConfig: ProviderConfig = {
      provider: typeof cfg?.provider === "string" ? cfg.provider : undefined,
      geminiApiKey: typeof cfg?.geminiApiKey === "string" ? cfg.geminiApiKey : undefined,
      geminiModel: typeof cfg?.geminiModel === "string" ? cfg.geminiModel : undefined,
      geminiFallbackModel: typeof cfg?.geminiFallbackModel === "string" ? cfg.geminiFallbackModel : undefined,
      openaiApiKey: typeof cfg?.openaiApiKey === "string" ? cfg.openaiApiKey : undefined,
      openaiModel: typeof cfg?.openaiModel === "string" ? cfg.openaiModel : undefined,
    };

    const action = body?.action as string | undefined;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "roadmap") {
      const goal = compactText(body.goal, 180);
      const incomingAnswers = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
      const answers = {
        level: compactText(incomingAnswers.level, 80),
        hours: compactText(incomingAnswers.hours, 80),
        pace: compactText(incomingAnswers.pace, 80),
        outcome: compactText(incomingAnswers.outcome, 120),
        deadline: compactText(incomingAnswers.deadline, 120),
        background: compactText(incomingAnswers.background, 220),
        strengths: compactText(incomingAnswers.strengths, 160),
        weakAreas: compactText(incomingAnswers.weakAreas, 180),
        learningStyle: compactText(incomingAnswers.learningStyle, 140),
        resources: compactText(incomingAnswers.resources, 220),
        targetRole: compactText(incomingAnswers.targetRole, 160),
      };

      if (!goal) {
        return new Response(JSON.stringify({ error: "Missing goal." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const profileBits = [
          `lv:${answers.level || "n/a"}`,
          `hr:${answers.hours || "n/a"}`,
          `pc:${answers.pace || "n/a"}`,
          `out:${answers.outcome || "n/a"}`,
          `dl:${answers.deadline || "n/a"}`,
          `bg:${answers.background || "n/a"}`,
          `str:${answers.strengths || "n/a"}`,
          `wk:${answers.weakAreas || "n/a"}`,
          `ls:${answers.learningStyle || "n/a"}`,
          `rs:${answers.resources || "n/a"}`,
          `tr:${answers.targetRole || "n/a"}`,
        ].join("; ");

        const rawData = await callAiJson<unknown>([
          {
            role: "system",
            content: "Return valid JSON only.",
          },
          {
            role: "user",
            content: `Goal: ${goal}
P: ${profileBits}

Return compact JSON schema:
{
  "t":"title",
  "gs":"goal summary",
  "d":"estimated duration",
  "se":[{"t":"section title","d":"section desc","o":0}],
  "mi":[{
    "s":"section title",
    "t":"milestone title",
    "d":"milestone description",
    "lv":"beginner|intermediate|advanced",
    "et":"2 weeks",
    "xp":80,
    "g":["goal step 1", "goal step 2"],
    "dep":["previous milestone title"],
    "f":false,
    "o":0
  }]
}

Rules: 4-6 sections, 8-10 milestones, each milestone has 2-3 actionable goals, one final milestone with f=true, xp 40..220, dependencies acyclic, profile-aware personalization.`,
          },
        ], runtimeConfig, { temperature: 0.5, maxOutputTokens: 1250 });

        const data = parseRoadmapPayload(rawData, goal);

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (aiErr) {
        const fb = fallbackRoadmap(goal, answers);
        return new Response(JSON.stringify({ ...fb, warning: `AI fallback used: ${aiErr instanceof Error ? aiErr.message : "provider error"}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "exam") {
      const milestoneTitle = compactText(body.milestoneTitle, 120);
      const milestoneDescription = compactText(body.milestoneDescription, 220);
      const goalSummary = compactText(body.goalSummary, 180);
      const userQuestions = compactList(body.userQuestions, 6, 120);

      const rawData = await callAiJson<unknown>([
        {
          role: "system",
          content: "Return valid JSON only.",
        },
        {
          role: "user",
          content: `Create exam JSON for:
- milestone: ${milestoneTitle}
- description: ${milestoneDescription}
- overall goal: ${goalSummary}
- learner focus: ${JSON.stringify(userQuestions)}

Return compact schema:
{"q":[{"q":"question","o":["A","B","C","D"],"a":0}]}

Rules: exactly 10 items, each has 4 options, a is 0..3, no duplicates, practical and milestone-specific.`,
        },
      ], runtimeConfig, { temperature: 0.65, maxOutputTokens: 900 });

      const data = parseExamPayload(rawData);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mentor") {
      const milestoneTitle = compactText(body.milestoneTitle, 120);
      const milestoneDescription = compactText(body.milestoneDescription, 220);
      const goalSummary = compactText(body.goalSummary, 180);
      const goals = compactList(body.goals, 4, 120);
      const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];
      const userMessage = compactText(body.userMessage, 320);
      const goalsText = goals.join(" | ");

      const recentHistory = chatHistory
        .slice(-6)
        .map((m: { role?: string; content?: string }) => `${m.role === "assistant" ? "assistant" : "user"}: ${compactText(m.content, 180)}`)
        .filter(Boolean)
        .join("\n");

      const data = await callAiJson<{ reply: string }>([
        {
          role: "system",
          content: "Return valid JSON only in shape {\"reply\":\"...\"}. You are a concise career mentor.",
        },
        {
          role: "user",
          content: `Context:
- User roadmap goal: ${goalSummary}
- Current milestone: ${milestoneTitle}
- Milestone description: ${milestoneDescription}
- Milestone goals: ${goalsText || "n/a"}

Conversation so far:
${recentHistory || "(empty)"}

User's new message:
${userMessage}

Reply in 3-6 concise sentences with practical next steps and one short example.
`,
        },
  ], runtimeConfig, { temperature: 0.4, maxOutputTokens: 220 });

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = message.includes("(429)")
      ? 429
      : message.includes("(503)") || message.includes("UNAVAILABLE")
      ? 503
      : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
