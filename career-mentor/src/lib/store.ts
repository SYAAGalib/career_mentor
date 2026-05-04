// Local state management with localStorage persistence
export interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  rewardXp: number;
  goals: Goal[];
  status: "locked" | "unlocked" | "in_progress" | "exam_ready" | "passed";
  examScore?: number;
  dependsOn: string[];
  parallelWith: string[];
  orderIndex: number;
  isFinal?: boolean;
}

export interface Certificate {
  id: string;
  roadmapTitle: string;
  holderName: string;
  issuedAt: string;
  totalXp: number;
  milestoneCount: number;
  finalExamScore: number;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface Roadmap {
  id: string;
  title: string;
  goalSummary: string;
  estimatedDuration: string;
  sections: Section[];
  milestones: Milestone[];
  createdAt: string;
}

export interface UserProgress {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  badges: string[];
  completedMilestones: string[];
}

export interface AppState {
  roadmap: Roadmap | null;
  progress: UserProgress;
  onboardingComplete: boolean;
  aiApiKey: string;
  chatHistory: Record<string, { role: string; content: string }[]>;
  certificates: Certificate[];
}

const DEFAULT_STATE: AppState = {
  roadmap: null,
  progress: {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    badges: [],
    completedMilestones: [],
  },
  onboardingComplete: false,
  aiApiKey: "",
  chatHistory: {},
  certificates: [],
};

export function loadState(): AppState {
  // DB-backed state: local cache persistence is intentionally disabled.
  return DEFAULT_STATE;
}

export function saveState(state: AppState) {
  // DB-backed state: local cache persistence is intentionally disabled.
  void state;
}

export function resetState() {
  // DB-backed state: local cache persistence is intentionally disabled.
}
