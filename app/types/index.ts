export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  assignee: string;
  columnId: string;
  from: string;
}

export interface ColumnType {
  id: string;
  title: string;
  color: string;
}

export const COLUMNS: ColumnType[] = [
  { id: "backlog", title: "Backlog", color: "#64748b" },
  { id: "todo", title: "To Do", color: "#38bdf8" },
  { id: "in-progress", title: "In Progress", color: "#a78bfa" },
  { id: "review", title: "Review", color: "#fbbf24" },
  { id: "done", title: "Done", color: "#34d399" },
];

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Low", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  medium: { label: "Medium", color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  high: { label: "High", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  urgent: { label: "Urgent", color: "#e879f9", bg: "rgba(232,121,249,0.12)" },
};

export const SAMPLE_TASKS: Task[] = [];

// export const SAMPLE_TASKS: Task[] = [
//   {
//     id: "t1",
//     title: "Design system setup",
//     description:
//       "Create color palette, typography scale, and base component library",
//     from: "test",
//     priority: "high",
//     tags: ["design", "ui"],
//     assignee: "AM",
//     columnId: "done",
//   },
//   {
//     id: "t2",
//     title: "Authentication flow",
//     description:
//       "Implement JWT-based auth with refresh tokens and session management",
//     from: "test",
//     priority: "urgent",
//     tags: ["backend", "security"],
//     assignee: "JD",
//     columnId: "in-progress",
//   },
//   {
//     id: "t3",
//     title: "Dashboard analytics",
//     description: "Build real-time charts and metrics visualization components",
//     from: "test",
//     priority: "high",
//     tags: ["frontend", "charts"],
//     assignee: "SK",
//     columnId: "in-progress",
//   },
//   {
//     id: "t4",
//     title: "User onboarding flow",
//     description: "Step-by-step walkthrough modal for new users on first login",
//     from: "test",
//     priority: "medium",
//     tags: ["ux", "product"],
//     assignee: "LM",
//     columnId: "review",
//   },
//   {
//     id: "t5",
//     title: "Performance audit",
//     description: "Reduce bundle size and improve Core Web Vitals scores",
//     from: "test",
//     priority: "medium",
//     tags: ["perf"],
//     assignee: "AM",
//     columnId: "todo",
//   },
//   {
//     id: "t6",
//     title: "Mobile responsive layout",
//     description:
//       "Ensure all views work correctly on mobile and tablet breakpoints",
//     from: "test",
//     priority: "low",
//     tags: ["mobile", "css"],
//     assignee: "SK",
//     columnId: "todo",
//   },
//   {
//     id: "t7",
//     title: "E2E test coverage",
//     description:
//       "Write Playwright tests for all critical user interaction paths",
//     from: "test",
//     priority: "low",
//     tags: ["testing", "qa"],
//     assignee: "JD",
//     columnId: "backlog",
//   },
//   {
//     id: "t8",
//     title: "CI/CD pipeline",
//     description:
//       "Set up GitHub Actions with automated deploy to staging and production",
//     from: "test",
//     priority: "medium",
//     tags: ["devops"],
//     assignee: "LM",
//     columnId: "backlog",
//   },
// ];
