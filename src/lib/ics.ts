import type { Assignment } from "@/types/canvas";
import { format } from "date-fns";

/**
 * Format date for ICS file (UTC format: YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate unique ID for ICS event
 */
function generateUID(id: string): string {
  return `${id}@canvas-pp`;
}

/**
 * Create ICS content for a single assignment
 */
export function createAssignmentICS(assignment: Assignment): string {
  const dueDate = new Date(assignment.due_at);
  const now = new Date();
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Canvas++//Assignment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${generateUID(assignment.id)}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(dueDate)}`,
    `DTEND:${formatICSDate(new Date(dueDate.getTime() + 60 * 60 * 1000))}`, // 1 hour duration
    `SUMMARY:${escapeICS(assignment.name)}`,
    `DESCRIPTION:${escapeICS(`Course: ${assignment.course_name}${assignment.points_possible ? `\\nPoints: ${assignment.points_possible}` : ''}${assignment.description ? `\\n\\n${assignment.description.substring(0, 500)}` : ''}`)}`,
    assignment.html_url ? `URL:${assignment.html_url}` : '',
    `CATEGORIES:${escapeICS(assignment.course_name)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(assignment.name)} is due in 1 hour`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  
  return lines.join('\r\n');
}

/**
 * Create ICS content for multiple assignments
 */
export function createMultipleAssignmentsICS(assignments: Assignment[], title?: string): string {
  const now = new Date();
  
  const events = assignments.map((assignment) => {
    const dueDate = new Date(assignment.due_at);
    
    return [
      'BEGIN:VEVENT',
      `UID:${generateUID(assignment.id)}`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(dueDate)}`,
      `DTEND:${formatICSDate(new Date(dueDate.getTime() + 60 * 60 * 1000))}`,
      `SUMMARY:${escapeICS(assignment.name)}`,
      `DESCRIPTION:${escapeICS(`Course: ${assignment.course_name}${assignment.points_possible ? `\\nPoints: ${assignment.points_possible}` : ''}`)}`,
      assignment.html_url ? `URL:${assignment.html_url}` : '',
      `CATEGORIES:${escapeICS(assignment.course_name)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Canvas++//Assignments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    title ? `X-WR-CALNAME:${escapeICS(title)}` : '',
    ...events,
    'END:VCALENDAR',
  ].filter(Boolean);
  
  return lines.join('\r\n');
}

/**
 * Download ICS file to user's device
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Download single assignment as ICS
 */
export function downloadAssignmentICS(assignment: Assignment): void {
  const content = createAssignmentICS(assignment);
  const filename = `${assignment.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  downloadICS(content, filename);
}

/**
 * Download multiple assignments as single ICS file
 */
export function downloadWeekICS(assignments: Assignment[], weekLabel?: string): void {
  const content = createMultipleAssignmentsICS(assignments, weekLabel || 'Canvas++ Assignments');
  const filename = `canvas-assignments-${format(new Date(), 'yyyy-MM-dd')}.ics`;
  downloadICS(content, filename);
}
