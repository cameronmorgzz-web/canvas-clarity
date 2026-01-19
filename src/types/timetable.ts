export interface TimetableEntry {
  day: string;
  period: string;
  start: string;
  subject: string;
  course: string;
  teacher: string;
  room: string;
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export type Day = typeof DAYS[number];

export const PERIOD_TIMES: Record<string, { start: string; end: string }> = {
  "Period 1": { start: "08:10", end: "08:50" },
  "Period 2": { start: "08:50", end: "09:30" },
  "Period 3": { start: "09:30", end: "10:10" },
  "Period 4": { start: "10:10", end: "10:50" },
  "Period 5": { start: "11:10", end: "11:50" },
  "Period 6": { start: "11:50", end: "12:30" },
  "Period 7": { start: "12:30", end: "13:10" },
  "Period 8": { start: "13:10", end: "13:50" },
};

// Subject color mapping for visual distinction
export const SUBJECT_COLORS: Record<string, string> = {
  "IGCSE Computer Science": "#3B82F6",
  "IGCSE Physics": "#8B5CF6",
  "IGCSE French": "#EC4899",
  "IGCSE Maths Ext": "#F59E0B",
  "IGCSE Global Perspectives": "#10B981",
  "IGCSE English Literature": "#EF4444",
  "IGCSE Economics": "#06B6D4",
  "Italian Language and Culture Acquisition": "#22C55E",
  "Cycle Tests": "#6B7280",
  "HS Form": "#9CA3AF",
};
