import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Course colors palette
const COURSE_COLORS = [
  "#4DA3FF", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

async function canvasFetch<T>(endpoint: string, apiUrl: string, apiToken: string): Promise<T> {
  const url = `${apiUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Canvas API error (${response.status}):`, errorText);
    throw new Error(`Canvas API error: ${response.status}`);
  }

  return response.json();
}

async function fetchCourses(apiUrl: string, apiToken: string): Promise<CanvasCourse[]> {
  try {
    const courses = await canvasFetch<CanvasCourse[]>(
      "/api/v1/courses?enrollment_state=active&per_page=50",
      apiUrl,
      apiToken
    );
    return courses.filter((c) => c.name && c.id);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

async function fetchAssignmentsForCourse(
  course: CanvasCourse,
  courseColor: string,
  apiUrl: string,
  apiToken: string
): Promise<any[]> {
  try {
    const assignments = await canvasFetch<CanvasAssignment[]>(
      `/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
      apiUrl,
      apiToken
    );

    const now = new Date();

    return assignments
      .filter((a) => a.due_at) // Only assignments with due dates
      .map((a) => {
        const dueDate = new Date(a.due_at!);
        const submission = a.submission;

        // Determine status
        let status: "overdue" | "due_today" | "due_soon" | "future";
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) {
          status = "overdue";
        } else if (diffHours <= 24 && dueDate.toDateString() === now.toDateString()) {
          status = "due_today";
        } else if (diffHours <= 48) {
          status = "due_soon";
        } else {
          status = "future";
        }

        // Determine submission state
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
          due_at: a.due_at,
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
): Promise<any[]> {
  try {
    const contextCodes = courses.map((c) => `course_${c.id}`).join("&context_codes[]=");
    const announcements = await canvasFetch<CanvasAnnouncement[]>(
      `/api/v1/announcements?context_codes[]=${contextCodes}&per_page=50`,
      apiUrl,
      apiToken
    );

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    return announcements.map((a) => {
      const courseId = parseInt(a.context_code.replace("course_", ""));
      const course = courseMap.get(courseId);

      // Strip HTML for preview
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CANVAS_API_URL = Deno.env.get("CANVAS_API_URL");
    const CANVAS_API_TOKEN = Deno.env.get("CANVAS_API_TOKEN");

    if (!CANVAS_API_URL || !CANVAS_API_TOKEN) {
      console.error("Missing Canvas configuration");
      return new Response(
        JSON.stringify({ error: "Canvas API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "upcoming";
    const days = parseInt(url.searchParams.get("days") || "14");

    // Fetch all courses first
    const courses = await fetchCourses(CANVAS_API_URL, CANVAS_API_TOKEN);
    console.log(`Fetched ${courses.length} courses`);

    // Assign colors to courses
    const courseColorMap = new Map<number, string>();
    courses.forEach((course, index) => {
      courseColorMap.set(course.id, COURSE_COLORS[index % COURSE_COLORS.length]);
    });

    if (endpoint === "courses") {
      const formattedCourses = courses.map((c, index) => ({
        id: String(c.id),
        name: c.name,
        course_code: c.course_code,
        color: COURSE_COLORS[index % COURSE_COLORS.length],
        html_url: `${CANVAS_API_URL}/courses/${c.id}`,
      }));

      return new Response(JSON.stringify(formattedCourses), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (endpoint === "announcements") {
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

      return new Response(JSON.stringify(filtered), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: fetch upcoming assignments
    const allAssignments: any[] = [];
    for (const course of courses) {
      const color = courseColorMap.get(course.id) || "#6366F1";
      const assignments = await fetchAssignmentsForCourse(course, color, CANVAS_API_URL, CANVAS_API_TOKEN);
      allAssignments.push(...assignments);
    }

    console.log(`Fetched ${allAssignments.length} total assignments`);

    // Filter by date range
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + days);

    const relevantAssignments = allAssignments.filter((a) => {
      const dueDate = new Date(a.due_at);
      // Include overdue (past 30 days) and future (within range)
      const pastLimit = new Date();
      pastLimit.setDate(pastLimit.getDate() - 30);
      return dueDate >= pastLimit && dueDate <= futureLimit;
    });

    // Sort by due date
    relevantAssignments.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

    if (endpoint === "assignments") {
      return new Response(JSON.stringify(relevantAssignments), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group for upcoming endpoint
    const overdue = relevantAssignments.filter((a) => a.status === "overdue");
    const due_today = relevantAssignments.filter((a) => a.status === "due_today");
    const due_soon = relevantAssignments.filter((a) => a.status === "due_soon");
    const this_week = relevantAssignments.filter((a) => a.status === "future");

    return new Response(
      JSON.stringify({ overdue, due_today, due_soon, this_week }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
