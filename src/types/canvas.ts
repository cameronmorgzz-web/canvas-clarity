export interface Course {
  id: string;
  name: string;
  course_code: string;
  color: string;
  html_url: string;
}

export interface Assignment {
  id: string;
  name: string;
  course_id: string;
  course_name: string;
  course_color?: string;
  due_at: string;
  points_possible: number | null;
  status: "overdue" | "due_today" | "due_soon" | "future";
  submission_state: "not_submitted" | "submitted" | "missing" | "graded";
  html_url: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  course_id: string;
  course_name: string;
  course_color?: string;
  posted_at: string;
  message_preview: string;
  html_url: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  type: "assignment" | "event";
  course_id?: string;
  course_name?: string;
  course_color?: string;
  html_url?: string;
}

export interface HealthResponse {
  ok: boolean;
}

export interface UpcomingResponse {
  overdue: Assignment[];
  due_today: Assignment[];
  due_soon: Assignment[];
  this_week: Assignment[];
}

export interface Settings {
  refreshInterval: number;
  showGrades: boolean;
  showAnnouncements: boolean;
}
