import type {
  Course,
  Assignment,
  Announcement,
  CalendarEvent,
  HealthResponse,
} from "@/types/canvas";
import { getEnv, validateEnv } from "@/lib/env";
import { parseApiError, type AppError } from "@/types/errors";

/**
 * Get Supabase configuration from environment
 */
function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL');
  const key = getEnv('SUPABASE_ANON_KEY');
  
  if (!url || !key) {
    throw new Error('Supabase configuration not found');
  }
  
  return { url, key };
}

/**
 * Fetch data from Canvas edge function with proper error handling
 */
async function fetchFromCanvas<T>(
  endpoint: string, 
  params?: Record<string, string>
): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const requestUrl = `${url}/functions/v1/canvas-data?${searchParams}`;

  const response = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = parseApiError(data, response.status);
    throw error;
  }

  return data as T;
}

/**
 * Check if Canvas API is configured and accessible
 */
export async function checkHealth(): Promise<HealthResponse> {
  const { valid, missing } = validateEnv();
  
  if (!valid) {
    return { ok: false };
  }
  
  try {
    // Quick test by fetching courses
    await fetchFromCanvas<Course[]>("courses");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Fetch all active courses
 */
export async function fetchCourses(): Promise<Course[]> {
  return fetchFromCanvas<Course[]>("courses");
}

/**
 * Fetch upcoming assignments grouped by status
 */
export async function fetchUpcoming(days: number = 14): Promise<{
  overdue: Assignment[];
  due_today: Assignment[];
  due_soon: Assignment[];
  this_week: Assignment[];
}> {
  return fetchFromCanvas("upcoming", { days: String(days) });
}

/**
 * Fetch assignments for a specific course
 */
export async function fetchCourseAssignments(courseId: string): Promise<Assignment[]> {
  return fetchFromCanvas<Assignment[]>("course_assignments", { courseId });
}

/**
 * Fetch announcements for a specific course
 */
export async function fetchCourseAnnouncements(courseId: string): Promise<Announcement[]> {
  return fetchFromCanvas<Announcement[]>("course_announcements", { courseId });
}

/**
 * Fetch all assignments with optional filtering
 */
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

/**
 * Fetch announcements with optional filtering
 */
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

/**
 * Fetch calendar events (assignments as events)
 */
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

/**
 * Trigger a refresh of all data
 */
export async function triggerRefresh(): Promise<void> {
  console.log("Refresh triggered - fetching fresh data from Canvas");
  // The actual refresh happens through React Query invalidation
}

/**
 * Check if an error indicates setup is needed
 */
export function isSetupNeeded(error: unknown): boolean {
  if (!error) return false;
  
  const appError = error as AppError;
  return appError.code === 'NOT_CONFIGURED' || appError.code === 'AUTH';
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  const appError = error as AppError;
  if (appError.message) return appError.message;
  if (error instanceof Error) return error.message;
  
  return 'An unknown error occurred';
}
