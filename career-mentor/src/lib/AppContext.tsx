import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { AppState, loadState, saveState, Roadmap, Milestone, Certificate } from "./store";
import { supabase } from "@/integrations/supabase/client";

interface AppContextType {
  state: AppState;
  recentlyUnlocked: string[];
  setRoadmap: (roadmap: Roadmap) => void;
  completeGoal: (milestoneId: string, goalId: string) => void;
  submitExam: (milestoneId: string, score: number, examPayload?: {
    questions: { question: string; options: string[]; correctIndex: number; selectedIndex?: number }[];
  }) => void;
  setApiKey: (key: string) => void;
  addChatMessage: (milestoneId: string, role: string, content: string) => void;
  resetAll: () => void;
  getMilestone: (id: string) => Milestone | undefined;
  issueCertificate: (holderName: string) => Certificate | null;
}

const AppContext = createContext<AppContextType | null>(null);

type DbMaps = {
  roadmapId: string | null;
  milestoneByLocalId: Record<string, string>;
  goalByLocalId: Record<string, string>;
};

const EMPTY_MAPS: DbMaps = {
  roadmapId: null,
  milestoneByLocalId: {},
  goalByLocalId: {},
};

const db = supabase as any;

function fallbackGoalTitle(milestoneTitle: string, index: number): string {
  if (index === 0) return `Read and summarize the core concepts for ${milestoneTitle}.`;
  if (index === 1) return `Practice ${milestoneTitle} using guided exercises.`;
  return `Build a mini task to apply ${milestoneTitle} in practice.`;
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function loadFromDatabase(userId: string): Promise<{ state: Partial<AppState>; maps: DbMaps } | null> {
  const { data: roadmapRow } = await db
    .from("roadmaps")
    .select("id,title,goal_summary,estimated_duration,created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!roadmapRow) return null;

  const roadmapId = roadmapRow.id as string;

  const [{ data: sectionsRows }, { data: milestonesRows }, { data: goalsRows }, { data: chatRows }, { data: certRows }] = await Promise.all([
    db.from("sections").select("id,title,description,order_index").eq("roadmap_id", roadmapId).order("order_index", { ascending: true }),
    db.from("milestones").select("id,section_id,title,description,difficulty,estimated_time,reward_xp,status,exam_score,depends_on,parallel_with,order_index,is_final").eq("roadmap_id", roadmapId).order("order_index", { ascending: true }),
    db.from("goals").select("id,milestone_id,title,completed,order_index").order("order_index", { ascending: true }),
    db.from("chat_messages").select("milestone_id,role,content,created_at").eq("roadmap_id", roadmapId).order("created_at", { ascending: true }),
    db.from("certificates").select("id,roadmap_title,holder_name,issued_at,total_xp,milestone_count,final_exam_score").eq("roadmap_id", roadmapId).order("issued_at", { ascending: false }),
  ]);

  const sections = (sectionsRows || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description || "",
    orderIndex: s.order_index,
  }));

  const goalsByMilestone: Record<string, any[]> = {};
  (goalsRows || []).forEach((g: any) => {
    if (!goalsByMilestone[g.milestone_id]) goalsByMilestone[g.milestone_id] = [];
    goalsByMilestone[g.milestone_id].push(g);
  });

  const milestones = (milestonesRows || []).map((m: any) => ({
    id: m.id,
    sectionId: m.section_id,
    title: m.title,
    description: m.description || "",
    difficulty: m.difficulty,
    estimatedTime: m.estimated_time || "",
    rewardXp: m.reward_xp || 0,
    goals: (goalsByMilestone[m.id] || []).map((g: any, index: number) => ({
      id: g.id,
      title: typeof g.title === "string" && g.title.trim() ? g.title.trim() : fallbackGoalTitle(m.title || "this milestone", index),
      completed: Boolean(g.completed),
    })),
    status: m.status,
    examScore: m.exam_score ?? undefined,
    dependsOn: Array.isArray(m.depends_on) ? m.depends_on : [],
    parallelWith: Array.isArray(m.parallel_with) ? m.parallel_with : [],
    orderIndex: m.order_index,
    isFinal: Boolean(m.is_final),
  })) as Milestone[];

  const chatHistory: Record<string, { role: string; content: string }[]> = {};
  (chatRows || []).forEach((c: any) => {
    const key = c.milestone_id;
    if (!chatHistory[key]) chatHistory[key] = [];
    chatHistory[key].push({ role: c.role, content: c.content });
  });

  const certificates: Certificate[] = (certRows || []).map((c: any) => ({
    id: c.id,
    roadmapTitle: c.roadmap_title,
    holderName: c.holder_name,
    issuedAt: c.issued_at,
    totalXp: c.total_xp,
    milestoneCount: c.milestone_count,
    finalExamScore: c.final_exam_score,
  }));

  const completedMilestones = milestones.filter((m) => m.status === "passed").map((m) => m.id);
  const completedGoalsCount = milestones.reduce((acc, m) => acc + m.goals.filter((g) => g.completed).length, 0);
  const passedMilestones = milestones.filter((m) => m.status === "passed");
  const passedMilestonesCount = passedMilestones.length;
  const passedMilestonesXp = passedMilestones.reduce((acc, m) => acc + (m.rewardXp || 0), 0);
  const hasPerfectionist = passedMilestones.some((m) => (m.examScore ?? 0) === 100);

  const badges: string[] = [];
  if (passedMilestonesCount >= 1) badges.push("First Milestone");
  if (passedMilestonesCount >= 5) badges.push("Five Down");
  if (passedMilestonesCount >= 3) badges.push("Streak 3");
  if (completedGoalsCount * 10 + passedMilestonesXp >= 500) badges.push("XP 500");
  if (hasPerfectionist) badges.push("Perfectionist");

  const roadmap: Roadmap = {
    id: roadmapId,
    title: roadmapRow.title,
    goalSummary: roadmapRow.goal_summary,
    estimatedDuration: roadmapRow.estimated_duration || "",
    sections,
    milestones,
    createdAt: roadmapRow.created_at,
  };

  const maps: DbMaps = {
    roadmapId,
    milestoneByLocalId: Object.fromEntries(milestones.map((m) => [m.id, m.id])),
    goalByLocalId: Object.fromEntries(milestones.flatMap((m) => m.goals.map((g) => [g.id, g.id]))),
  };

  return {
    state: {
      roadmap,
      onboardingComplete: true,
      chatHistory,
      certificates,
      progress: {
        totalXp: completedGoalsCount * 10 + passedMilestonesXp,
        currentStreak: passedMilestonesCount,
        longestStreak: passedMilestonesCount,
        lastActivityDate: new Date().toISOString(),
        badges,
        completedMilestones,
      },
    },
    maps,
  };
}

async function saveRoadmapToDatabase(userId: string, roadmap: Roadmap): Promise<DbMaps> {
  await db.from("roadmaps").delete().eq("user_id", userId).eq("status", "active");

  const { data: roadmapRow, error: roadmapErr } = await db
    .from("roadmaps")
    .insert({
      user_id: userId,
      title: roadmap.title,
      goal_summary: roadmap.goalSummary,
      estimated_duration: roadmap.estimatedDuration,
      status: "active",
    })
    .select("id")
    .single();

  if (roadmapErr || !roadmapRow?.id) throw roadmapErr || new Error("Failed to save roadmap.");

  const roadmapId = roadmapRow.id as string;
  const sectionIdMap: Record<string, string> = {};
  const milestoneIdMap: Record<string, string> = {};
  const goalIdMap: Record<string, string> = {};

  for (const section of [...roadmap.sections].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const { data: row } = await db
      .from("sections")
      .insert({
        roadmap_id: roadmapId,
        title: section.title,
        description: section.description,
        order_index: section.orderIndex,
      })
      .select("id")
      .single();
    if (row?.id) sectionIdMap[section.id] = row.id;
  }

  const stagedDeps: Array<{ dbId: string; dependsOn: string[]; parallelWith: string[] }> = [];
  for (const milestone of [...roadmap.milestones].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const { data: row } = await db
      .from("milestones")
      .insert({
        roadmap_id: roadmapId,
        section_id: sectionIdMap[milestone.sectionId] || null,
        title: milestone.title,
        description: milestone.description,
        difficulty: milestone.difficulty,
        estimated_time: milestone.estimatedTime,
        reward_xp: milestone.rewardXp,
        status: milestone.status,
        exam_score: milestone.examScore ?? null,
        depends_on: [],
        parallel_with: [],
        order_index: milestone.orderIndex,
        is_final: Boolean(milestone.isFinal),
      })
      .select("id")
      .single();
    if (!row?.id) continue;
    milestoneIdMap[milestone.id] = row.id;
    stagedDeps.push({ dbId: row.id, dependsOn: milestone.dependsOn, parallelWith: milestone.parallelWith });

    for (const [i, goal] of milestone.goals.entries()) {
      const { data: goalRow } = await db
        .from("goals")
        .insert({
          milestone_id: row.id,
          title: goal.title,
          completed: goal.completed,
          order_index: i,
        })
        .select("id")
        .single();
      if (goalRow?.id) goalIdMap[goal.id] = goalRow.id;
    }
  }

  for (const dep of stagedDeps) {
    await db
      .from("milestones")
      .update({
        depends_on: dep.dependsOn.map((id) => milestoneIdMap[id]).filter(Boolean),
        parallel_with: dep.parallelWith.map((id) => milestoneIdMap[id]).filter(Boolean),
      })
      .eq("id", dep.dbId);
  }

  return {
    roadmapId,
    milestoneByLocalId: milestoneIdMap,
    goalByLocalId: goalIdMap,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const dbMapsRef = useRef<DbMaps>(EMPTY_MAPS);

  const persist = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const userId = await getUserId();
      if (!userId) return;
      const loaded = await loadFromDatabase(userId);
      if (!loaded || !isMounted) return;
      dbMapsRef.current = loaded.maps;
      setState((prev) => {
        const merged = { ...prev, ...loaded.state, onboardingComplete: Boolean(loaded.state.roadmap) } as AppState;
        saveState(merged);
        return merged;
      });
    };

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  const setRoadmap = useCallback((roadmap: Roadmap) => {
    const next = { ...state, roadmap, onboardingComplete: true };
    persist(next);

    void (async () => {
      const userId = await getUserId();
      if (!userId) return;
      try {
        const maps = await saveRoadmapToDatabase(userId, roadmap);
        dbMapsRef.current = maps;
      } catch (error) {
        console.error("Failed to save roadmap to database", error);
      }
    })();
  }, [state, persist]);

  const completeGoal = useCallback((milestoneId: string, goalId: string) => {
    if (!state.roadmap) return;
    let gainedXp = 0;
    const milestones = state.roadmap.milestones.map(m => {
      if (m.id !== milestoneId) return m;
      const goals = m.goals.map(g => {
        if (g.id !== goalId) return g;
        if (g.completed) return g;
        gainedXp += 10;
        return { ...g, completed: true };
      });
      const allDone = goals.every(g => g.completed);
      return { ...m, goals, status: allDone ? "exam_ready" as const : "in_progress" as const };
    });
    if (gainedXp === 0) return;
    const newState = {
      ...state,
      roadmap: { ...state.roadmap, milestones },
      progress: { ...state.progress, totalXp: state.progress.totalXp + gainedXp },
    };
    persist(newState);

    void (async () => {
      const dbMilestoneId = dbMapsRef.current.milestoneByLocalId[milestoneId] || milestoneId;
      const dbGoalId = dbMapsRef.current.goalByLocalId[goalId] || goalId;
      const updatedMilestone = milestones.find((m) => m.id === milestoneId);
      await db.from("goals").update({ completed: true }).eq("id", dbGoalId);
      if (updatedMilestone) {
        await db.from("milestones").update({ status: updatedMilestone.status }).eq("id", dbMilestoneId);
      }
    })();
  }, [state, persist]);

  const submitExam = useCallback((milestoneId: string, score: number, examPayload?: {
    questions: { question: string; options: string[]; correctIndex: number; selectedIndex?: number }[];
  }) => {
    if (!state.roadmap) return;
    const passed = score >= 80;
    const target = state.roadmap.milestones.find((m) => m.id === milestoneId);
    const wasPassed = target?.status === "passed";
    const examRewardXp = target?.rewardXp || 0;
    let milestones = state.roadmap.milestones.map(m => {
      if (m.id !== milestoneId) return m;
      return { ...m, status: passed ? "passed" as const : m.status, examScore: score };
    });
    // Unlock dependents
    const newlyUnlocked: string[] = [];
    if (passed) {
      milestones = milestones.map(m => {
        if (m.status !== "locked") return m;
        const depsmet = m.dependsOn.every(depId =>
          milestones.find(dm => dm.id === depId)?.status === "passed"
        );
        if (depsmet) {
          newlyUnlocked.push(m.id);
          return { ...m, status: "unlocked" as const };
        }
        return m;
      });
      if (newlyUnlocked.length > 0) {
        setRecentlyUnlocked(newlyUnlocked);
        setTimeout(() => setRecentlyUnlocked([]), 2000);
      }
    }
    const xpGain = passed && !wasPassed ? examRewardXp : 0;
    const completedSet = new Set(state.progress.completedMilestones);
    if (passed) completedSet.add(milestoneId);
    const completedMs = Array.from(completedSet);

    const streak = state.progress.currentStreak + (passed && !wasPassed ? 1 : 0);
    const totalXp = state.progress.totalXp + xpGain;

    const badgeSet = new Set(state.progress.badges);
    if (completedMs.length >= 1) badgeSet.add("First Milestone");
    if (completedMs.length >= 5) badgeSet.add("Five Down");
    if (streak >= 3) badgeSet.add("Streak 3");
    if (totalXp >= 500) badgeSet.add("XP 500");
    if (passed && score === 100) badgeSet.add("Perfectionist");

    const newState = {
      ...state,
      roadmap: { ...state.roadmap, milestones },
      progress: {
        ...state.progress,
        totalXp,
        badges: Array.from(badgeSet),
        completedMilestones: completedMs,
        currentStreak: streak,
        longestStreak: Math.max(state.progress.longestStreak, streak),
        lastActivityDate: new Date().toISOString(),
      },
    };
    persist(newState);

    void (async () => {
      const userId = await getUserId();
      if (!userId) return;
      const dbRoadmapId = dbMapsRef.current.roadmapId;
      const dbMilestoneId = dbMapsRef.current.milestoneByLocalId[milestoneId] || milestoneId;
      if (dbRoadmapId) {
        const { data: attempt } = await db
          .from("exam_attempts")
          .insert({
            user_id: userId,
            roadmap_id: dbRoadmapId,
            milestone_id: dbMilestoneId,
            score,
            passed,
          })
          .select("id")
          .single();

        if (attempt?.id && examPayload?.questions?.length) {
          await db.from("exam_questions").insert(
            examPayload.questions.map((q, i) => ({
              attempt_id: attempt.id,
              question: q.question,
              options: q.options,
              correct_index: q.correctIndex,
              selected_index: q.selectedIndex ?? null,
              order_index: i,
            }))
          );
        }
      }

      await db.from("milestones").update({
        status: milestones.find((m) => m.id === milestoneId)?.status,
        exam_score: score,
      }).eq("id", dbMilestoneId);
    })();
  }, [state, persist]);

  const setApiKey = useCallback((key: string) => {
    persist({ ...state, aiApiKey: key });
  }, [state, persist]);

  const addChatMessage = useCallback((milestoneId: string, role: string, content: string) => {
    const history = { ...state.chatHistory };
    if (!history[milestoneId]) history[milestoneId] = [];
    history[milestoneId] = [...history[milestoneId], { role, content }];
    persist({ ...state, chatHistory: history });

    void (async () => {
      const userId = await getUserId();
      const dbRoadmapId = dbMapsRef.current.roadmapId;
      if (!userId || !dbRoadmapId) return;
      const dbMilestoneId = dbMapsRef.current.milestoneByLocalId[milestoneId] || milestoneId;
      await db.from("chat_messages").insert({
        user_id: userId,
        roadmap_id: dbRoadmapId,
        milestone_id: dbMilestoneId,
        role,
        content,
      });
    })();
  }, [state, persist]);

  const resetAll = useCallback(() => {
    const fresh: AppState = {
      roadmap: null,
      progress: { totalXp: 0, currentStreak: 0, longestStreak: 0, lastActivityDate: "", badges: [], completedMilestones: [] },
      onboardingComplete: false,
      aiApiKey: state.aiApiKey,
      chatHistory: {},
      certificates: [],
    };
    persist(fresh);

    dbMapsRef.current = EMPTY_MAPS;
    void (async () => {
      const userId = await getUserId();
      if (!userId) return;
      await db.from("roadmaps").delete().eq("user_id", userId);
      await db.from("certificates").delete().eq("user_id", userId);
      await db.from("chat_messages").delete().eq("user_id", userId);
      await db.from("exam_attempts").delete().eq("user_id", userId);
    })();
  }, [state, persist]);

  const getMilestone = useCallback((id: string) => {
    return state.roadmap?.milestones.find(m => m.id === id);
  }, [state.roadmap]);

  const issueCertificate = useCallback((holderName: string): Certificate | null => {
    if (!state.roadmap) return null;
    const finalMilestone = state.roadmap.milestones.find(m => m.isFinal);
    if (!finalMilestone || finalMilestone.status !== "passed") return null;
    // Check if already issued
    const existing = state.certificates.find(c => c.roadmapTitle === state.roadmap!.title);
    if (existing) return existing;
    const cert: Certificate = {
      id: "cert_" + Date.now(),
      roadmapTitle: state.roadmap.title,
      holderName,
      issuedAt: new Date().toISOString(),
      totalXp: state.progress.totalXp,
      milestoneCount: state.roadmap.milestones.length,
      finalExamScore: finalMilestone.examScore || 0,
    };
    persist({ ...state, certificates: [...state.certificates, cert] });

    void (async () => {
      const userId = await getUserId();
      const dbRoadmapId = dbMapsRef.current.roadmapId;
      if (!userId || !dbRoadmapId) return;
      await db.from("certificates").upsert({
        user_id: userId,
        roadmap_id: dbRoadmapId,
        roadmap_title: cert.roadmapTitle,
        holder_name: cert.holderName,
        issued_at: cert.issuedAt,
        total_xp: cert.totalXp,
        milestone_count: cert.milestoneCount,
        final_exam_score: cert.finalExamScore,
      });
    })();

    return cert;
  }, [state, persist]);

  return (
    <AppContext.Provider value={{ state, recentlyUnlocked, setRoadmap, completeGoal, submitExam, setApiKey, addChatMessage, resetAll, getMilestone, issueCertificate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
