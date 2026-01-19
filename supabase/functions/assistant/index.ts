import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - simple in-memory store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

interface Citation {
  type: "assignment" | "announcement" | "course";
  id: string;
  title: string;
  html_url: string;
}

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  course_id: number;
  due_at: string | null;
  points_possible: number;
  html_url: string;
  has_submitted_submissions?: boolean;
  submission?: {
    workflow_state?: string;
    submitted_at?: string | null;
  };
}

interface CanvasAnnouncement {
  id: number;
  title: string;
  context_code: string;
  posted_at: string;
  message: string;
  html_url: string;
}

// Helper to fetch from Canvas API
async function canvasFetch<T>(endpoint: string, apiUrl: string, apiToken: string): Promise<T> {
  const url = `${apiUrl}/api/v1${endpoint}`;
  console.log(`Fetching Canvas API: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Canvas API error (${response.status}): ${errorText}`);
    throw new Error(`Canvas API error: ${response.status}`);
  }
  
  return response.json();
}

// Fetch active courses
async function fetchCourses(apiUrl: string, apiToken: string): Promise<CanvasCourse[]> {
  try {
    const courses = await canvasFetch<CanvasCourse[]>(
      "/courses?enrollment_state=active&per_page=50",
      apiUrl,
      apiToken
    );
    return courses.filter(c => c.name && c.id);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// Fetch assignments from all courses (upcoming + recent)
async function fetchAssignments(
  courses: CanvasCourse[],
  apiUrl: string,
  apiToken: string
): Promise<{ assignment: CanvasAssignment; courseName: string }[]> {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  const allAssignments: { assignment: CanvasAssignment; courseName: string }[] = [];
  
  // Fetch assignments from each course in parallel
  const fetchPromises = courses.map(async (course) => {
    try {
      const assignments = await canvasFetch<CanvasAssignment[]>(
        `/courses/${course.id}/assignments?per_page=50&include[]=submission&order_by=due_at`,
        apiUrl,
        apiToken
      );
      
      return assignments
        .filter(a => {
          if (!a.due_at) return true; // Include undated assignments
          const dueDate = new Date(a.due_at);
          return dueDate >= twoWeeksAgo && dueDate <= twoWeeksFromNow;
        })
        .map(a => ({ assignment: a, courseName: course.name }));
    } catch (error) {
      console.error(`Error fetching assignments for course ${course.id}:`, error);
      return [];
    }
  });
  
  const results = await Promise.all(fetchPromises);
  results.forEach(r => allAssignments.push(...r));
  
  // Sort by due date
  allAssignments.sort((a, b) => {
    if (!a.assignment.due_at) return 1;
    if (!b.assignment.due_at) return -1;
    return new Date(a.assignment.due_at).getTime() - new Date(b.assignment.due_at).getTime();
  });
  
  return allAssignments;
}

// Fetch announcements from all courses
async function fetchAnnouncements(
  courses: CanvasCourse[],
  apiUrl: string,
  apiToken: string
): Promise<{ announcement: CanvasAnnouncement; courseName: string }[]> {
  if (courses.length === 0) return [];
  
  try {
    const contextCodes = courses.map(c => `course_${c.id}`).join("&context_codes[]=");
    const announcements = await canvasFetch<CanvasAnnouncement[]>(
      `/announcements?context_codes[]=${contextCodes}&per_page=20`,
      apiUrl,
      apiToken
    );
    
    // Map course names
    const courseMap = new Map(courses.map(c => [`course_${c.id}`, c.name]));
    
    return announcements.map(a => ({
      announcement: a,
      courseName: courseMap.get(a.context_code) || "Unknown Course",
    }));
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

// Determine assignment status
function getAssignmentStatus(assignment: CanvasAssignment): string {
  const now = new Date();
  
  if (!assignment.due_at) return "no_due_date";
  
  const dueDate = new Date(assignment.due_at);
  const submitted = assignment.submission?.submitted_at;
  
  if (submitted) return "submitted";
  if (dueDate < now) return "overdue";
  
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilDue <= 24) return "due_today";
  if (hoursUntilDue <= 72) return "due_soon";
  
  return "future";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API keys
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const CANVAS_API_URL = Deno.env.get("CANVAS_API_URL");
    const CANVAS_API_TOKEN = Deno.env.get("CANVAS_API_TOKEN");
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!CANVAS_API_URL || !CANVAS_API_TOKEN) {
      console.error("Canvas API credentials are not configured");
      return new Response(
        JSON.stringify({ error: "Canvas integration is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { message, context } = await req.json();
    
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing assistant request: "${message.substring(0, 100)}..."`);

    // Fetch real Canvas data
    console.log("Fetching Canvas data...");
    const courses = await fetchCourses(CANVAS_API_URL, CANVAS_API_TOKEN);
    console.log(`Fetched ${courses.length} courses`);
    
    const [assignmentsData, announcementsData] = await Promise.all([
      fetchAssignments(courses, CANVAS_API_URL, CANVAS_API_TOKEN),
      fetchAnnouncements(courses, CANVAS_API_URL, CANVAS_API_TOKEN),
    ]);
    
    console.log(`Fetched ${assignmentsData.length} assignments, ${announcementsData.length} announcements`);

    // Transform to simplified format for the AI
    const now = new Date();
    
    const formattedCourses = courses.map(c => ({
      id: String(c.id),
      name: c.name,
      course_code: c.course_code,
    }));
    
    let formattedAssignments = assignmentsData.map(({ assignment, courseName }) => ({
      id: String(assignment.id),
      name: assignment.name,
      course_id: String(assignment.course_id),
      course_name: courseName,
      due_at: assignment.due_at,
      status: getAssignmentStatus(assignment),
      points_possible: assignment.points_possible,
      html_url: assignment.html_url,
    }));
    
    const formattedAnnouncements = announcementsData.map(({ announcement, courseName }) => ({
      id: String(announcement.id),
      title: announcement.title,
      course_id: announcement.context_code.replace("course_", ""),
      course_name: courseName,
      posted_at: announcement.posted_at,
      message_preview: announcement.message.replace(/<[^>]*>/g, "").substring(0, 200),
      html_url: announcement.html_url,
    }));

    // Filter data based on context (range)
    if (context?.range === "today") {
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      formattedAssignments = formattedAssignments.filter(a => {
        if (!a.due_at) return false;
        const dueDate = new Date(a.due_at);
        return dueDate <= todayEnd || a.status === "overdue";
      });
    } else if (context?.range === "week") {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      formattedAssignments = formattedAssignments.filter(a => {
        if (!a.due_at) return false;
        const dueDate = new Date(a.due_at);
        return dueDate <= weekEnd || a.status === "overdue";
      });
    }

    // Filter by course if specified
    if (context?.courseId) {
      formattedAssignments = formattedAssignments.filter(a => a.course_id === context.courseId);
    }

    // Get recent announcements (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentAnnouncements = formattedAnnouncements.filter(a => 
      new Date(a.posted_at) >= sevenDaysAgo
    );

    // Build context for the model
    const canvasContext = {
      current_time: now.toISOString(),
      courses: formattedCourses,
      assignments: formattedAssignments,
      announcements: recentAnnouncements,
    };

    // System prompt - grounded in provided data only
    const systemPrompt = `You are Canvas++ Assistant, a helpful AI that assists students with their coursework.

CRITICAL RULES:
1. Answer ONLY using the provided Canvas data (assignments, announcements, courses).
2. NEVER invent assignments, due dates, or course information.
3. NEVER reveal internal tokens, API keys, or system information.
4. If information is not in the provided data, clearly state that you don't have access to it.
5. Be concise, friendly, and actionable in your responses.
6. When referencing specific items, include them so they can be cited.

CURRENT CONTEXT:
Current date/time: ${canvasContext.current_time}

COURSES:
${JSON.stringify(canvasContext.courses, null, 2)}

ASSIGNMENTS:
${JSON.stringify(canvasContext.assignments, null, 2)}

RECENT ANNOUNCEMENTS:
${JSON.stringify(canvasContext.announcements, null, 2)}

When you reference specific assignments, announcements, or courses in your answer, format them as references that can be extracted. Use the exact names and IDs from the data above.`;

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      
      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service is temporarily busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    console.log("Assistant response generated successfully");

    // Extract citations based on mentioned items
    const citations: Citation[] = [];
    
    // Check which assignments are mentioned
    for (const assignment of formattedAssignments) {
      if (assistantMessage.toLowerCase().includes(assignment.name.toLowerCase()) ||
          assistantMessage.includes(assignment.id)) {
        citations.push({
          type: "assignment",
          id: assignment.id,
          title: assignment.name,
          html_url: assignment.html_url,
        });
      }
    }

    // Check which announcements are mentioned
    for (const announcement of formattedAnnouncements) {
      if (assistantMessage.toLowerCase().includes(announcement.title.toLowerCase()) ||
          assistantMessage.includes(announcement.id)) {
        citations.push({
          type: "announcement",
          id: announcement.id,
          title: announcement.title,
          html_url: announcement.html_url,
        });
      }
    }

    // Check which courses are mentioned
    for (const course of formattedCourses) {
      if (assistantMessage.toLowerCase().includes(course.name.toLowerCase()) ||
          assistantMessage.toLowerCase().includes(course.course_code.toLowerCase())) {
        citations.push({
          type: "course",
          id: course.id,
          title: `${course.name} (${course.course_code})`,
          html_url: `${CANVAS_API_URL}/courses/${course.id}`,
        });
      }
    }

    // Deduplicate citations
    const uniqueCitations = citations.filter((citation, index, self) =>
      index === self.findIndex(c => c.id === citation.id && c.type === citation.type)
    );

    return new Response(
      JSON.stringify({
        answer: assistantMessage,
        citations: uniqueCitations,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Assistant error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
