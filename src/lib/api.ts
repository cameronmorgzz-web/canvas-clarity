import type {
  Course,
  Assignment,
  Announcement,
  CalendarEvent,
  HealthResponse,
} from "@/types/canvas";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchFromCanvas<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const url = `${SUPABASE_URL}/functions/v1/canvas-data?${searchParams}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  return { ok: true };
}

export async function fetchCourses(): Promise<Course[]> {
  return fetchFromCanvas<Course[]>("courses");
}

export async function fetchUpcoming(days: number = 14): Promise<{
  overdue: Assignment[];
  due_today: Assignment[];
  due_soon: Assignment[];
  this_week: Assignment[];
}> {
  return fetchFromCanvas("upcoming", { days: String(days) });
}

export async function fetchAssignments(params: {
  from?: string;
  to?: string;
  status?: string;
  courseId?: string;
  q?: string;
  sort?: string;
}): Promise<Assignment[]> {
  const queryParams: Record<string, string> = {};
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;
  if (params.status) queryParams.status = params.status;
  if (params.courseId) queryParams.courseId = params.courseId;
  if (params.q) queryParams.q = params.q;
  if (params.sort) queryParams.sort = params.sort;

  const assignments = await fetchFromCanvas<Assignment[]>("assignments", queryParams);

  // Client-side filtering for status and search
  let filtered = [...assignments];
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

  return filtered;
}

export async function fetchAnnouncements(params: {
  days?: number;
  courseId?: string;
}): Promise<Announcement[]> {
  const queryParams: Record<string, string> = {};
  if (params.days) queryParams.days = String(params.days);

  const announcements = await fetchFromCanvas<Announcement[]>("announcements", queryParams);

  // Client-side filtering by course
  if (params.courseId) {
    return announcements.filter((a) => a.course_id === params.courseId);
  }

  return announcements;
}

export async function fetchCalendar(params: {
  from: string;
  to: string;
}): Promise<CalendarEvent[]> {
  const assignments = await fetchFromCanvas<Assignment[]>("assignments", {
    from: params.from,
    to: params.to,
  });

  // Convert assignments to calendar events
  return assignments.map((a) => ({
    id: a.id,
    title: a.name,
    start_at: a.due_at,
    type: "assignment" as const,
    course_id: a.course_id,
    course_name: a.course_name,
    course_color: a.course_color,
    html_url: a.html_url,
  }));
}

export async function triggerRefresh(): Promise<void> {
  // No-op for now - data is always fresh from Canvas
  console.log("Refresh triggered - fetching fresh data from Canvas");
}
