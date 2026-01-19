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

// Mock Canvas data - in production, these would be fetched from actual Canvas API
const MOCK_COURSES = [
  { id: "c1", name: "Calculus II", course_code: "MATH 202" },
  { id: "c2", name: "Organic Chemistry", course_code: "CHEM 301" },
  { id: "c3", name: "Modern Literature", course_code: "ENG 215" },
  { id: "c4", name: "Data Structures", course_code: "CS 201" },
];

const MOCK_ASSIGNMENTS = [
  {
    id: "a1",
    name: "Problem Set 4: Integration",
    course_id: "c1",
    course_name: "Calculus II",
    due_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "overdue",
    points_possible: 100,
    html_url: "https://canvas.instructure.com/courses/c1/assignments/a1",
  },
  {
    id: "a2",
    name: "Lab Report: Synthesis",
    course_id: "c2",
    course_name: "Organic Chemistry",
    due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: "due_today",
    points_possible: 50,
    html_url: "https://canvas.instructure.com/courses/c2/assignments/a2",
  },
  {
    id: "a3",
    name: "Essay: Postmodern Themes",
    course_id: "c3",
    course_name: "Modern Literature",
    due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "due_soon",
    points_possible: 150,
    html_url: "https://canvas.instructure.com/courses/c3/assignments/a3",
  },
  {
    id: "a4",
    name: "Binary Trees Implementation",
    course_id: "c4",
    course_name: "Data Structures",
    due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "future",
    points_possible: 100,
    html_url: "https://canvas.instructure.com/courses/c4/assignments/a4",
  },
  {
    id: "a5",
    name: "Reading Quiz Ch. 8-10",
    course_id: "c3",
    course_name: "Modern Literature",
    due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    status: "due_soon",
    points_possible: 25,
    html_url: "https://canvas.instructure.com/courses/c3/assignments/a5",
  },
];

const MOCK_ANNOUNCEMENTS = [
  {
    id: "n1",
    title: "Office Hours Cancelled Friday",
    course_id: "c1",
    course_name: "Calculus II",
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    message_preview: "Due to the department meeting, office hours on Friday are cancelled. Please email me if you have urgent questions.",
    html_url: "https://canvas.instructure.com/courses/c1/announcements/n1",
  },
  {
    id: "n2",
    title: "Lab Safety Reminder",
    course_id: "c2",
    course_name: "Organic Chemistry",
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    message_preview: "Please remember to wear safety goggles at all times in the lab. We've had some close calls recently.",
    html_url: "https://canvas.instructure.com/courses/c2/announcements/n2",
  },
  {
    id: "n3",
    title: "Guest Speaker Next Week",
    course_id: "c3",
    course_name: "Modern Literature",
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    message_preview: "Award-winning author Sarah Mitchell will be speaking in our class next Tuesday. Attendance is mandatory.",
    html_url: "https://canvas.instructure.com/courses/c3/announcements/n3",
  },
];

interface Citation {
  type: "assignment" | "announcement" | "course";
  id: string;
  title: string;
  html_url: string;
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

    // Get OpenAI API key
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
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

    // Filter data based on context (range)
    const now = new Date();
    let filteredAssignments = [...MOCK_ASSIGNMENTS];
    
    if (context?.range === "today") {
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      filteredAssignments = MOCK_ASSIGNMENTS.filter(a => {
        const dueDate = new Date(a.due_at);
        return dueDate <= todayEnd || a.status === "overdue";
      });
    } else if (context?.range === "week") {
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filteredAssignments = MOCK_ASSIGNMENTS.filter(a => {
        const dueDate = new Date(a.due_at);
        return dueDate <= weekEnd || a.status === "overdue";
      });
    }

    // Filter by course if specified
    if (context?.courseId) {
      filteredAssignments = filteredAssignments.filter(a => a.course_id === context.courseId);
    }

    // Get recent announcements (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentAnnouncements = MOCK_ANNOUNCEMENTS.filter(a => 
      new Date(a.posted_at) >= sevenDaysAgo
    );

    // Build context for the model
    const canvasContext = {
      current_time: now.toISOString(),
      courses: MOCK_COURSES,
      assignments: filteredAssignments,
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
    for (const assignment of MOCK_ASSIGNMENTS) {
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
    for (const announcement of MOCK_ANNOUNCEMENTS) {
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
    for (const course of MOCK_COURSES) {
      if (assistantMessage.toLowerCase().includes(course.name.toLowerCase()) ||
          assistantMessage.toLowerCase().includes(course.course_code.toLowerCase())) {
        citations.push({
          type: "course",
          id: course.id,
          title: `${course.name} (${course.course_code})`,
          html_url: `https://canvas.instructure.com/courses/${course.id}`,
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
