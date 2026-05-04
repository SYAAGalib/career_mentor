import { Roadmap } from "./store";

export function generateMockRoadmap(goal: string): Roadmap {
  const goalLower = goal.toLowerCase();
  let title = "Custom Learning Roadmap";
  let sections, milestones;

  if (goalLower.includes("frontend") || goalLower.includes("web")) {
    title = "Frontend Developer Roadmap";
    sections = [
      { id: "s1", title: "Foundations", description: "Core web technologies", orderIndex: 0 },
      { id: "s2", title: "Styling & Layout", description: "CSS and responsive design", orderIndex: 1 },
      { id: "s3", title: "JavaScript Mastery", description: "Advanced JS concepts", orderIndex: 2 },
      { id: "s4", title: "React & Ecosystem", description: "Modern frontend framework", orderIndex: 3 },
      { id: "s5", title: "Final Assessment", description: "Prove your mastery", orderIndex: 4 },
    ];
    milestones = [
      { id: "m1", sectionId: "s1", title: "HTML Fundamentals", description: "Learn semantic HTML, forms, and document structure.", difficulty: "beginner" as const, estimatedTime: "4 hours", rewardXp: 50, goals: [{ id: "g1", title: "Understand HTML tags & elements", completed: false }, { id: "g2", title: "Build a basic HTML page", completed: false }, { id: "g3", title: "Learn forms & inputs", completed: false }], status: "unlocked" as const, dependsOn: [], parallelWith: [], orderIndex: 0 },
      { id: "m2", sectionId: "s1", title: "Web Fundamentals", description: "How the web works: HTTP, browsers, DNS.", difficulty: "beginner" as const, estimatedTime: "3 hours", rewardXp: 40, goals: [{ id: "g4", title: "Understand HTTP protocol", completed: false }, { id: "g5", title: "Learn how browsers render pages", completed: false }], status: "unlocked" as const, dependsOn: [], parallelWith: ["m1"], orderIndex: 1 },
      { id: "m3", sectionId: "s2", title: "CSS Basics", description: "Selectors, box model, colors, typography.", difficulty: "beginner" as const, estimatedTime: "5 hours", rewardXp: 60, goals: [{ id: "g6", title: "Master CSS selectors", completed: false }, { id: "g7", title: "Understand the box model", completed: false }, { id: "g8", title: "Style a complete page", completed: false }], status: "locked" as const, dependsOn: ["m1"], parallelWith: [], orderIndex: 2 },
      { id: "m4", sectionId: "s2", title: "Flexbox & Grid", description: "Modern CSS layout techniques.", difficulty: "intermediate" as const, estimatedTime: "4 hours", rewardXp: 70, goals: [{ id: "g9", title: "Build layouts with Flexbox", completed: false }, { id: "g10", title: "Build layouts with CSS Grid", completed: false }, { id: "g11", title: "Create a responsive page", completed: false }], status: "locked" as const, dependsOn: ["m3"], parallelWith: [], orderIndex: 3 },
      { id: "m5", sectionId: "s3", title: "JavaScript Basics", description: "Variables, functions, loops, and DOM.", difficulty: "intermediate" as const, estimatedTime: "6 hours", rewardXp: 80, goals: [{ id: "g12", title: "Learn variables & data types", completed: false }, { id: "g13", title: "Write functions & control flow", completed: false }, { id: "g14", title: "Manipulate the DOM", completed: false }], status: "locked" as const, dependsOn: ["m1", "m2"], parallelWith: [], orderIndex: 4 },
      { id: "m6", sectionId: "s3", title: "Async JavaScript", description: "Promises, async/await, fetch API.", difficulty: "intermediate" as const, estimatedTime: "4 hours", rewardXp: 80, goals: [{ id: "g15", title: "Understand callbacks & promises", completed: false }, { id: "g16", title: "Use async/await", completed: false }, { id: "g17", title: "Fetch data from APIs", completed: false }], status: "locked" as const, dependsOn: ["m5"], parallelWith: [], orderIndex: 5 },
      { id: "m7", sectionId: "s4", title: "React Fundamentals", description: "Components, JSX, props, and state.", difficulty: "intermediate" as const, estimatedTime: "8 hours", rewardXp: 100, goals: [{ id: "g18", title: "Create React components", completed: false }, { id: "g19", title: "Manage state with useState", completed: false }, { id: "g20", title: "Handle events & forms", completed: false }, { id: "g21", title: "Build a small React app", completed: false }], status: "locked" as const, dependsOn: ["m6", "m4"], parallelWith: [], orderIndex: 6 },
      { id: "m8", sectionId: "s4", title: "React Hooks & Routing", description: "useEffect, custom hooks, React Router.", difficulty: "advanced" as const, estimatedTime: "6 hours", rewardXp: 120, goals: [{ id: "g22", title: "Master useEffect", completed: false }, { id: "g23", title: "Create custom hooks", completed: false }, { id: "g24", title: "Add routing to your app", completed: false }], status: "locked" as const, dependsOn: ["m7"], parallelWith: [], orderIndex: 7 },
      { id: "m_final", sectionId: "s5", title: "Final Exam — Frontend Developer", description: "Comprehensive exam covering all topics. Pass to earn your certificate!", difficulty: "advanced" as const, estimatedTime: "1 hour", rewardXp: 200, goals: [{ id: "g_final_1", title: "Review all milestone content", completed: false }, { id: "g_final_2", title: "Complete the final assessment", completed: false }], status: "locked" as const, dependsOn: ["m8"], parallelWith: [], orderIndex: 8, isFinal: true },
    ];
  } else if (goalLower.includes("data") || goalLower.includes("python")) {
    title = "Data Science Roadmap";
    sections = [
      { id: "s1", title: "Python Basics", description: "Core Python programming", orderIndex: 0 },
      { id: "s2", title: "Data Analysis", description: "Pandas, NumPy, visualization", orderIndex: 1 },
      { id: "s3", title: "Machine Learning", description: "ML fundamentals", orderIndex: 2 },
      { id: "s4", title: "Final Assessment", description: "Prove your mastery", orderIndex: 3 },
    ];
    milestones = [
      { id: "m1", sectionId: "s1", title: "Python Fundamentals", description: "Variables, loops, functions in Python.", difficulty: "beginner" as const, estimatedTime: "5 hours", rewardXp: 50, goals: [{ id: "g1", title: "Install Python & set up environment", completed: false }, { id: "g2", title: "Learn variables & data types", completed: false }, { id: "g3", title: "Write functions & loops", completed: false }], status: "unlocked" as const, dependsOn: [], parallelWith: [], orderIndex: 0 },
      { id: "m2", sectionId: "s1", title: "Data Structures", description: "Lists, dicts, sets, tuples.", difficulty: "beginner" as const, estimatedTime: "4 hours", rewardXp: 50, goals: [{ id: "g4", title: "Master lists & tuples", completed: false }, { id: "g5", title: "Work with dictionaries & sets", completed: false }], status: "locked" as const, dependsOn: ["m1"], parallelWith: [], orderIndex: 1 },
      { id: "m3", sectionId: "s2", title: "NumPy & Pandas", description: "Data manipulation with Python.", difficulty: "intermediate" as const, estimatedTime: "6 hours", rewardXp: 70, goals: [{ id: "g6", title: "Create & manipulate arrays", completed: false }, { id: "g7", title: "Load & clean data with Pandas", completed: false }, { id: "g8", title: "Perform data aggregations", completed: false }], status: "locked" as const, dependsOn: ["m2"], parallelWith: [], orderIndex: 2 },
      { id: "m4", sectionId: "s2", title: "Data Visualization", description: "Matplotlib, Seaborn charts.", difficulty: "intermediate" as const, estimatedTime: "4 hours", rewardXp: 60, goals: [{ id: "g9", title: "Create basic charts", completed: false }, { id: "g10", title: "Build interactive visualizations", completed: false }], status: "locked" as const, dependsOn: ["m3"], parallelWith: [], orderIndex: 3 },
      { id: "m5", sectionId: "s3", title: "ML Fundamentals", description: "Supervised learning, regression, classification.", difficulty: "advanced" as const, estimatedTime: "8 hours", rewardXp: 100, goals: [{ id: "g11", title: "Understand supervised learning", completed: false }, { id: "g12", title: "Build a regression model", completed: false }, { id: "g13", title: "Build a classification model", completed: false }], status: "locked" as const, dependsOn: ["m3", "m4"], parallelWith: [], orderIndex: 4 },
      { id: "m_final", sectionId: "s4", title: "Final Exam — Data Science", description: "Comprehensive exam covering all topics. Pass to earn your certificate!", difficulty: "advanced" as const, estimatedTime: "1 hour", rewardXp: 200, goals: [{ id: "g_final_1", title: "Review all milestone content", completed: false }, { id: "g_final_2", title: "Complete the final assessment", completed: false }], status: "locked" as const, dependsOn: ["m5"], parallelWith: [], orderIndex: 5, isFinal: true },
    ];
  } else {
    title = `${goal} Roadmap`;
    sections = [
      { id: "s1", title: "Getting Started", description: "Foundation concepts", orderIndex: 0 },
      { id: "s2", title: "Core Skills", description: "Essential knowledge", orderIndex: 1 },
      { id: "s3", title: "Advanced Topics", description: "Deep dive", orderIndex: 2 },
      { id: "s4", title: "Final Assessment", description: "Prove your mastery", orderIndex: 3 },
    ];
    milestones = [
      { id: "m1", sectionId: "s1", title: "Introduction & Setup", description: `Get started with ${goal}.`, difficulty: "beginner" as const, estimatedTime: "3 hours", rewardXp: 40, goals: [{ id: "g1", title: "Understand the basics", completed: false }, { id: "g2", title: "Set up your environment", completed: false }], status: "unlocked" as const, dependsOn: [], parallelWith: ["m2"], orderIndex: 0 },
      { id: "m2", sectionId: "s1", title: "Key Concepts", description: "Learn the fundamental concepts.", difficulty: "beginner" as const, estimatedTime: "4 hours", rewardXp: 50, goals: [{ id: "g3", title: "Study core principles", completed: false }, { id: "g4", title: "Complete introductory exercises", completed: false }], status: "unlocked" as const, dependsOn: [], parallelWith: ["m1"], orderIndex: 1 },
      { id: "m3", sectionId: "s2", title: "Practical Skills", description: "Hands-on practice.", difficulty: "intermediate" as const, estimatedTime: "6 hours", rewardXp: 70, goals: [{ id: "g5", title: "Build a small project", completed: false }, { id: "g6", title: "Apply learned concepts", completed: false }, { id: "g7", title: "Review and iterate", completed: false }], status: "locked" as const, dependsOn: ["m1", "m2"], parallelWith: [], orderIndex: 2 },
      { id: "m4", sectionId: "s2", title: "Intermediate Challenges", description: "Push your skills further.", difficulty: "intermediate" as const, estimatedTime: "5 hours", rewardXp: 80, goals: [{ id: "g8", title: "Tackle complex problems", completed: false }, { id: "g9", title: "Optimize your solutions", completed: false }], status: "locked" as const, dependsOn: ["m3"], parallelWith: [], orderIndex: 3 },
      { id: "m5", sectionId: "s3", title: "Advanced Mastery", description: "Master advanced techniques.", difficulty: "advanced" as const, estimatedTime: "8 hours", rewardXp: 120, goals: [{ id: "g10", title: "Deep dive into advanced topics", completed: false }, { id: "g11", title: "Complete a capstone project", completed: false }], status: "locked" as const, dependsOn: ["m4"], parallelWith: [], orderIndex: 4 },
      { id: "m_final", sectionId: "s4", title: `Final Exam — ${goal}`, description: "Comprehensive exam covering all topics. Pass to earn your certificate!", difficulty: "advanced" as const, estimatedTime: "1 hour", rewardXp: 200, goals: [{ id: "g_final_1", title: "Review all milestone content", completed: false }, { id: "g_final_2", title: "Complete the final assessment", completed: false }], status: "locked" as const, dependsOn: ["m5"], parallelWith: [], orderIndex: 5, isFinal: true },
    ];
  }

  return {
    id: "roadmap_" + Date.now(),
    title,
    goalSummary: goal,
    estimatedDuration: milestones.reduce((acc, m) => acc + parseInt(m.estimatedTime), 0) + " hours",
    sections,
    milestones,
    createdAt: new Date().toISOString(),
  };
}

export function generateMockExam(milestoneTitle: string) {
  const topics = milestoneTitle.split(" ");
  const questions = Array.from({ length: 10 }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Question ${i + 1}: Which of the following best describes a key concept in ${milestoneTitle}?`,
    options: [
      `A fundamental principle of ${topics[0] || "the topic"}`,
      `An unrelated concept from a different field`,
      `A deprecated approach no longer used`,
      `None of the above`,
    ],
    correctIndex: 0,
  }));
  return questions;
}
