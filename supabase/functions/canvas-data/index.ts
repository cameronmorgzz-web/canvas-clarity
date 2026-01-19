import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==================== Types ====================

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  uuid: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  points_possible: number | null;
  html_url: string;
  course_id: number;
  submission?: {
    submitted_at: string | null;
    workflow_state: string;
    score: number | null;
    grade: string | null;
  };
  has_submitted_submissions?: boolean;
}

interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  html_url: string;
  context_code: string;
}

interface ApiError {
  code: string;
  message: string;
  hint?: string;
  status: number;
  retryAfter?: number;
}

// ==================== Cache ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const CACHE_TTL = {
  courses: 60 * 1000, // 1 minute
  assignments: 30 * 1000, // 30 seconds
  announcements: 60 * 1000, // 1 minute
  default: 30 * 1000,
};

function getCacheKey(endpoint: string, params: Record<string, string | undefined>): string {
  const sortedParams = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${endpoint}:${sortedParams}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlKey: keyof typeof CACHE_TTL = "default"): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL[ttlKey],
  });
}

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
    }
  }
}, 60 * 1000);

// ==================== Rate Limiting ====================

let rateLimitedUntil = 0;

function isRateLimited(): boolean {
  return Date.now() < rateLimitedUntil;
}

function handleRateLimit(retryAfter: number): void {
  rateLimitedUntil = Date.now() + retryAfter * 1000;
}

// ==================== Constants ====================

const COURSE_COLORS = [
  "#4DA3FF", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

// ==================== Canvas API ====================

async function canvasFetch<T>(
  endpoint: string, 
  apiUrl: string, 
  apiToken: string
): Promise<{ data: T | null; error: ApiError | null }> {
  // Check rate limit before making request
  if (isRateLimited()) {
    const retryAfter = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
    return {
      data: null,
      error: {
        code: "RATE_LIMIT",
        message: "Canvas API rate limit exceeded",
        hint: `Please wait ${retryAfter} seconds before retrying.`,
        status: 429,
        retryAfter,
      },
    };
  }

  try {
    const url = `${apiUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "30");
      handleRateLimit(retryAfter);
      return {
        data: null,
        error: {
          code: "RATE_LIMIT",
          message: "Canvas API rate limit exceeded",
          hint: `Please wait ${retryAfter} seconds before retrying.`,
          status: 429,
          retryAfter,
        },
      };
    }

    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      return {
        data: null,
        error: {
          code: "AUTH",
          message: "Canvas authentication failed",
          hint: "Your Canvas access token may be invalid or expired.",
          status: response.status,
        },
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error (${response.status}):`, errorText);
      return {
        data: null,
        error: {
          code: "CANVAS_ERROR",
          message: `Canvas API error: ${response.status}`,
          status: response.status,
        },
      };
    }

    return { data: await response.json(), error: null };
  } catch (error) {
    console.error("Canvas fetch error:", error);
    return {
      data: null,
      error: {
        code: "NETWORK",
        message: error instanceof Error ? error.message : "Network error",
        status: 500,
      },
    };
  }
}

// ==================== Data Fetchers ====================

async function fetchCourses(apiUrl: string, apiToken: string): Promise<{ data: CanvasCourse[] | null; error: ApiError | null }> {
  const cacheKey = getCacheKey("courses", {});
  const cached = getFromCache<CanvasCourse[]>(cacheKey);
  if (cached) {
    console.log("Returning cached courses");
    return { data: cached, error: null };
  }

  const result = await canvasFetch<CanvasCourse[]>(
    "/api/v1/courses?enrollment_state=active&per_page=50",
    apiUrl,
    apiToken
  );

  if (result.error) return { data: null, error: result.error };
  
  const courses = (result.data || []).filter((c) => c.name && c.id);
  setCache(cacheKey, courses, "courses");
  
  return { data: courses, error: null };
}

interface FormattedAssignment {
  id: string;
  name: string;
  course_id: string;
  course_name: string;
  course_color: string;
  due_at: string;
  points_possible: number | null;
  status: "overdue" | "due_today" | "due_soon" | "future";
  submission_state: "not_submitted" | "submitted" | "missing" | "graded";
  html_url: string;
  description: string | null;
}

interface FormattedAnnouncement {
  id: string;
  title: string;
  course_id: string;
  course_name: string;
  course_color: string;
  posted_at: string;
  message_preview: string;
  html_url: string;
}

async function fetchAssignmentsForCourse(
  course: CanvasCourse,
  courseColor: string,
  apiUrl: string,
  apiToken: string
): Promise<FormattedAssignment[]> {
  try {
    const result = await canvasFetch<CanvasAssignment[]>(
      `/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
      apiUrl,
      apiToken
    );

    if (result.error || !result.data) return [];

    const now = new Date();

    return result.data
      .filter((a) => a.due_at)
      .map((a) => {
        const dueDate = new Date(a.due_at!);
        const submission = a.submission;

        let status: "overdue" | "due_today" | "due_soon" | "future";
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) {
          status = "overdue";
        } else if (diffHours <= 24 && dueDate.toDateString() === now.toDateString()) {
          status = "due_today";
        } else if (diffHours <= 48) {
          status = "due_soon";
        } else {
          status = "future";
        }

        let submission_state: "not_submitted" | "submitted" | "missing" | "graded";
        if (submission?.grade !== null && submission?.grade !== undefined) {
          submission_state = "graded";
        } else if (submission?.submitted_at) {
          submission_state = "submitted";
        } else if (status === "overdue") {
          submission_state = "missing";
        } else {
          submission_state = "not_submitted";
        }

        return {
          id: String(a.id),
          name: a.name,
          course_id: String(course.id),
          course_name: course.name,
          course_color: courseColor,
          due_at: a.due_at!,
          points_possible: a.points_possible,
          status,
          submission_state,
          html_url: a.html_url,
          description: a.description,
        };
      });
  } catch (error) {
    console.error(`Error fetching assignments for course ${course.id}:`, error);
    return [];
  }
}

async function fetchAnnouncementsForCourses(
  courses: CanvasCourse[],
  courseColorMap: Map<number, string>,
  apiUrl: string,
  apiToken: string
): Promise<FormattedAnnouncement[]> {
  if (courses.length === 0) return [];
  
  try {
    const contextCodes = courses.map((c) => `course_${c.id}`).join("&context_codes[]=");
    const result = await canvasFetch<CanvasAnnouncement[]>(
      `/api/v1/announcements?context_codes[]=${contextCodes}&per_page=50`,
      apiUrl,
      apiToken
    );

    if (result.error || !result.data) return [];

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    return result.data.map((a) => {
      const courseId = parseInt(a.context_code.replace("course_", ""));
      const course = courseMap.get(courseId);

      const plainText = a.message
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const preview = plainText.length > 150 ? plainText.slice(0, 147) + "..." : plainText;

      return {
        id: String(a.id),
        title: a.title,
        course_id: String(courseId),
        course_name: course?.name || "Unknown Course",
        course_color: courseColorMap.get(courseId) || "#6366F1",
        posted_at: a.posted_at,
        message_preview: preview,
        html_url: a.html_url,
      };
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

// ==================== Response Helpers ====================

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(error: ApiError): Response {
  return new Response(
    JSON.stringify({
      code: error.code,
      message: error.message,
      hint: error.hint,
      retryAfter: error.retryAfter,
    }),
    {
      status: error.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// ==================== Main Handler ====================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CANVAS_API_URL = Deno.env.get("CANVAS_API_URL");
    const CANVAS_API_TOKEN = Deno.env.get("CANVAS_API_TOKEN");

    if (!CANVAS_API_URL || !CANVAS_API_TOKEN) {
      console.error("Missing Canvas configuration");
      return errorResponse({
        code: "NOT_CONFIGURED",
        message: "Canvas API not configured",
        hint: "Please set CANVAS_API_URL and CANVAS_API_TOKEN in your environment.",
        status: 500,
      });
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "upcoming";
    const days = parseInt(url.searchParams.get("days") || "14");
    const courseId = url.searchParams.get("courseId");

    console.log(`Processing request: endpoint=${endpoint}, days=${days}, courseId=${courseId}`);

    // Fetch all courses first (cached)
    const coursesResult = await fetchCourses(CANVAS_API_URL, CANVAS_API_TOKEN);
    
    if (coursesResult.error) {
      return errorResponse(coursesResult.error);
    }
    
    const courses = coursesResult.data || [];
    console.log(`Fetched ${courses.length} courses`);

    // Assign colors to courses
    const courseColorMap = new Map<number, string>();
    courses.forEach((course, index) => {
      courseColorMap.set(course.id, COURSE_COLORS[index % COURSE_COLORS.length]);
    });

    // ==================== Endpoint: courses ====================
    if (endpoint === "courses") {
      const formattedCourses = courses.map((c, index) => ({
        id: String(c.id),
        name: c.name,
        course_code: c.course_code,
        color: COURSE_COLORS[index % COURSE_COLORS.length],
        html_url: `${CANVAS_API_URL}/courses/${c.id}`,
      }));

      return jsonResponse(formattedCourses);
    }

    // ==================== Endpoint: course_assignments ====================
    if (endpoint === "course_assignments" && courseId) {
      const course = courses.find((c) => String(c.id) === courseId);
      if (!course) {
        return errorResponse({
          code: "NOT_FOUND",
          message: "Course not found",
          status: 404,
        });
      }
      
      const color = courseColorMap.get(course.id) || "#6366F1";
      const assignments = await fetchAssignmentsForCourse(course, color, CANVAS_API_URL, CANVAS_API_TOKEN);
      return jsonResponse(assignments);
    }

    // ==================== Endpoint: course_announcements ====================
    if (endpoint === "course_announcements" && courseId) {
      const course = courses.find((c) => String(c.id) === courseId);
      if (!course) {
        return errorResponse({
          code: "NOT_FOUND",
          message: "Course not found",
          status: 404,
        });
      }
      
      const announcements = await fetchAnnouncementsForCourses(
        [course],
        courseColorMap,
        CANVAS_API_URL,
        CANVAS_API_TOKEN
      );
      return jsonResponse(announcements);
    }

    // ==================== Endpoint: announcements ====================
    if (endpoint === "announcements") {
      const cacheKey = getCacheKey("announcements", { days: String(days) });
      const cached = getFromCache<FormattedAnnouncement[]>(cacheKey);
      
      if (cached) {
        console.log("Returning cached announcements");
        return jsonResponse(cached);
      }

      const announcements = await fetchAnnouncementsForCourses(
        courses,
        courseColorMap,
        CANVAS_API_URL,
        CANVAS_API_TOKEN
      );

      // Filter by days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = announcements.filter((a) => new Date(a.posted_at) >= cutoff);
      
      setCache(cacheKey, filtered, "announcements");
      return jsonResponse(filtered);
    }

    // ==================== Default: assignments / upcoming ====================
    const cacheKey = getCacheKey(endpoint, { days: String(days) });
    const cached = getFromCache<FormattedAssignment[]>(cacheKey);
    
    if (cached) {
      console.log(`Returning cached ${endpoint}`);
      return jsonResponse(cached);
    }

    // Fetch assignments for all courses in parallel
    const assignmentPromises = courses.map((course) => {
      const color = courseColorMap.get(course.id) || "#6366F1";
      return fetchAssignmentsForCourse(course, color, CANVAS_API_URL, CANVAS_API_TOKEN);
    });
    
    const assignmentResults = await Promise.all(assignmentPromises);
    const allAssignments: FormattedAssignment[] = assignmentResults.flat();

    console.log(`Fetched ${allAssignments.length} total assignments`);

    // Filter by date range
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + days);
    const pastLimit = new Date();
    pastLimit.setDate(pastLimit.getDate() - 30);

    const relevantAssignments = allAssignments.filter((a) => {
      const dueDate = new Date(a.due_at);
      return dueDate >= pastLimit && dueDate <= futureLimit;
    });

    // Sort by due date
    relevantAssignments.sort((a, b) => 
      new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    );

    if (endpoint === "assignments") {
      setCache(cacheKey, relevantAssignments, "assignments");
      return jsonResponse(relevantAssignments);
    }

    // Group for upcoming endpoint
    const overdue = relevantAssignments.filter((a) => a.status === "overdue");
    const due_today = relevantAssignments.filter((a) => a.status === "due_today");
    const due_soon = relevantAssignments.filter((a) => a.status === "due_soon");
    const this_week = relevantAssignments.filter((a) => a.status === "future");

    const upcomingData = { overdue, due_today, due_soon, this_week };
    setCache(cacheKey, upcomingData, "assignments");
    
    return jsonResponse(upcomingData);
  } catch (error) {
    console.error("Edge function error:", error);
    return errorResponse({
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
});
