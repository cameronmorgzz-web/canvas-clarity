import type {
  Course,
  Assignment,
  Announcement,
  CalendarEvent,
  HealthResponse,
} from "@/types/canvas";

const API_BASE = "/api";

// Mock data for demo/fallback when API is unavailable
const MOCK_COURSES: Course[] = [
  { id: "1", name: "Calculus II", course_code: "MATH-152", color: "#4DA3FF", html_url: "#" },
  { id: "2", name: "Computer Science 101", course_code: "CS-101", color: "#10B981", html_url: "#" },
  { id: "3", name: "Physics I", course_code: "PHYS-101", color: "#F59E0B", html_url: "#" },
  { id: "4", name: "English Literature", course_code: "ENG-201", color: "#8B5CF6", html_url: "#" },
  { id: "5", name: "Chemistry", course_code: "CHEM-101", color: "#EF4444", html_url: "#" },
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    name: "Integration by Parts Problem Set",
    course_id: "1",
    course_name: "Calculus II",
    course_color: "#4DA3FF",
    due_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 25,
    status: "overdue",
    submission_state: "missing",
    html_url: "#",
    description: "Complete problems 1-15 from Chapter 7. Show all work.",
  },
  {
    id: "a2",
    name: "Lab Report: Newton's Laws",
    course_id: "3",
    course_name: "Physics I",
    course_color: "#F59E0B",
    due_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 50,
    status: "overdue",
    submission_state: "not_submitted",
    html_url: "#",
  },
  {
    id: "a3",
    name: "Python Functions Quiz",
    course_id: "2",
    course_name: "Computer Science 101",
    course_color: "#10B981",
    due_at: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    points_possible: 20,
    status: "due_today",
    submission_state: "not_submitted",
    html_url: "#",
  },
  {
    id: "a4",
    name: "Essay: Shakespeare Analysis",
    course_id: "4",
    course_name: "English Literature",
    course_color: "#8B5CF6",
    due_at: new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    points_possible: 100,
    status: "due_today",
    submission_state: "submitted",
    html_url: "#",
    description: "Analyze the themes of power and corruption in Macbeth.",
  },
  {
    id: "a5",
    name: "Chemical Bonding Worksheet",
    course_id: "5",
    course_name: "Chemistry",
    course_color: "#EF4444",
    due_at: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 15,
    status: "due_soon",
    submission_state: "not_submitted",
    html_url: "#",
  },
  {
    id: "a6",
    name: "Data Structures Project",
    course_id: "2",
    course_name: "Computer Science 101",
    course_color: "#10B981",
    due_at: new Date(today.getTime() + 36 * 60 * 60 * 1000).toISOString(),
    points_possible: 150,
    status: "due_soon",
    submission_state: "not_submitted",
    html_url: "#",
    description: "Implement a binary search tree with insert, delete, and search operations.",
  },
  {
    id: "a7",
    name: "Series Convergence Test",
    course_id: "1",
    course_name: "Calculus II",
    course_color: "#4DA3FF",
    due_at: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 30,
    status: "future",
    submission_state: "graded",
    html_url: "#",
  },
  {
    id: "a8",
    name: "Lab: Projectile Motion",
    course_id: "3",
    course_name: "Physics I",
    course_color: "#F59E0B",
    due_at: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 40,
    status: "future",
    submission_state: "not_submitted",
    html_url: "#",
  },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "n1",
    title: "Midterm exam moved to next Friday",
    course_id: "1",
    course_name: "Calculus II",
    course_color: "#4DA3FF",
    posted_at: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    message_preview: "Due to scheduling conflicts, the midterm has been rescheduled...",
    html_url: "#",
  },
  {
    id: "n2",
    title: "Guest Speaker: AI in Modern Computing",
    course_id: "2",
    course_name: "Computer Science 101",
    course_color: "#10B981",
    posted_at: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    message_preview: "We'll have a special guest lecture on Thursday discussing...",
    html_url: "#",
  },
  {
    id: "n3",
    title: "Lab safety reminder",
    course_id: "5",
    course_name: "Chemistry",
    course_color: "#EF4444",
    posted_at: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    message_preview: "Please remember to wear safety goggles and lab coats at all times...",
    html_url: "#",
  },
  {
    id: "n4",
    title: "Office hours cancelled this week",
    course_id: "4",
    course_name: "English Literature",
    course_color: "#8B5CF6",
    posted_at: new Date(today.getTime() - 48 * 60 * 60 * 1000).toISOString(),
    message_preview: "I will be attending a conference and office hours are cancelled...",
    html_url: "#",
  },
];

async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch {
    console.warn(`API call to ${url} failed, using mock data`);
    return fallback;
  }
}

export async function checkHealth(): Promise<HealthResponse> {
  return fetchWithFallback(`${API_BASE}/health`, { ok: true });
}

export async function fetchCourses(): Promise<Course[]> {
  return fetchWithFallback(`${API_BASE}/courses`, MOCK_COURSES);
}

export async function fetchUpcoming(days: number = 14): Promise<{
  overdue: Assignment[];
  due_today: Assignment[];
  due_soon: Assignment[];
  this_week: Assignment[];
}> {
  const fallback = {
    overdue: MOCK_ASSIGNMENTS.filter((a) => a.status === "overdue"),
    due_today: MOCK_ASSIGNMENTS.filter((a) => a.status === "due_today"),
    due_soon: MOCK_ASSIGNMENTS.filter((a) => a.status === "due_soon"),
    this_week: MOCK_ASSIGNMENTS.filter((a) => a.status === "future"),
  };
  return fetchWithFallback(`${API_BASE}/upcoming?days=${days}`, fallback);
}

export async function fetchAssignments(params: {
  from?: string;
  to?: string;
  status?: string;
  courseId?: string;
  q?: string;
  sort?: string;
}): Promise<Assignment[]> {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.status) searchParams.set("status", params.status);
  if (params.courseId) searchParams.set("courseId", params.courseId);
  if (params.q) searchParams.set("q", params.q);
  if (params.sort) searchParams.set("sort", params.sort);

  const url = `${API_BASE}/assignments${searchParams.toString() ? `?${searchParams}` : ""}`;
  
  let filtered = [...MOCK_ASSIGNMENTS];
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((a) => a.submission_state === params.status);
  }
  if (params.courseId) {
    filtered = filtered.filter((a) => a.course_id === params.courseId);
  }
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter((a) => a.name.toLowerCase().includes(query));
  }
  
  return fetchWithFallback(url, filtered);
}

export async function fetchAnnouncements(params: {
  days?: number;
  courseId?: string;
}): Promise<Announcement[]> {
  const searchParams = new URLSearchParams();
  if (params.days) searchParams.set("days", String(params.days));
  if (params.courseId) searchParams.set("courseId", params.courseId);

  const url = `${API_BASE}/announcements${searchParams.toString() ? `?${searchParams}` : ""}`;
  
  let filtered = [...MOCK_ANNOUNCEMENTS];
  if (params.courseId) {
    filtered = filtered.filter((a) => a.course_id === params.courseId);
  }
  
  return fetchWithFallback(url, filtered);
}

export async function fetchCalendar(params: {
  from: string;
  to: string;
}): Promise<CalendarEvent[]> {
  const searchParams = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  const url = `${API_BASE}/calendar?${searchParams}`;
  
  const events: CalendarEvent[] = MOCK_ASSIGNMENTS.map((a) => ({
    id: a.id,
    title: a.name,
    start_at: a.due_at,
    type: "assignment" as const,
    course_id: a.course_id,
    course_name: a.course_name,
    course_color: a.course_color,
    html_url: a.html_url,
  }));
  
  return fetchWithFallback(url, events);
}

export async function triggerRefresh(): Promise<void> {
  try {
    await fetch(`${API_BASE}/refresh`, { method: "POST" });
  } catch {
    console.warn("Refresh endpoint not available");
  }
}
