/**
 * Format utilities for cleaning up Canvas data
 */

/**
 * Clean up a course code by removing prefixes and cryptic identifiers.
 * Examples:
 *   "Y10 IGCSE_CS 104" -> "Computer Science"
 *   "Y10 IGCSE_PHY 103" -> "Physics"
 *   "Y10 MAT_EXT 104" -> "Maths Ext"
 */
export function formatCourseCode(courseCode: string): string {
  if (!courseCode) return courseCode;
  
  // Known mappings for common course codes
  const COURSE_CODE_MAP: Record<string, string> = {
    "CS": "Computer Science",
    "PHY": "Physics",
    "FRE": "French",
    "MAT_EXT": "Maths Extended",
    "GP": "Global Perspectives",
    "LIT": "English Literature",
    "ECO": "Economics",
    "ITA_LCA": "Italian",
    "S_CTEST": "Cycle Tests",
    "PSHE/ASS": "Form Time",
  };
  
  // Try to extract the subject code from patterns like:
  // "Y10 IGCSE_CS 104" or "Y10 MAT_EXT 104"
  let cleaned = courseCode;
  
  // Remove year prefix (Y10, Y11, etc.)
  cleaned = cleaned.replace(/^Y\d+\s+/, "");
  
  // Remove trailing numbers
  cleaned = cleaned.replace(/\s+\d+$/, "");
  
  // Remove IGCSE_ prefix
  cleaned = cleaned.replace(/^IGCSE_/, "");
  
  // Check if we have a mapping for the cleaned code
  if (COURSE_CODE_MAP[cleaned]) {
    return COURSE_CODE_MAP[cleaned];
  }
  
  // Try partial matching
  for (const [code, name] of Object.entries(COURSE_CODE_MAP)) {
    if (cleaned.includes(code)) {
      return name;
    }
  }
  
  // Fallback: just clean up underscores and return
  return cleaned.replace(/_/g, " ");
}

/**
 * Extract a friendly subject name from the full course name.
 * Examples:
 *   "IGCSE Computer Science" -> "Computer Science"
 *   "IGCSE English Literature" -> "English Literature"
 */
export function formatCourseName(name: string): string {
  if (!name) return name;
  
  // Remove IGCSE prefix
  let cleaned = name.replace(/^IGCSE\s+/, "");
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^HS\s+/, "");
  
  return cleaned;
}

/**
 * Shorten a course name for display in pills/chips
 */
export function shortenCourseName(name: string, maxLength: number = 20): string {
  const formatted = formatCourseName(name);
  
  if (formatted.length <= maxLength) {
    return formatted;
  }
  
  // Known abbreviations
  const ABBREVIATIONS: Record<string, string> = {
    "Computer Science": "Comp Sci",
    "English Literature": "Eng Lit",
    "Global Perspectives": "GP",
    "Italian Language and Culture Acquisition": "Italian",
    "Maths Extended": "Maths Ext",
  };
  
  if (ABBREVIATIONS[formatted]) {
    return ABBREVIATIONS[formatted];
  }
  
  return formatted.substring(0, maxLength - 1) + "…";
}
