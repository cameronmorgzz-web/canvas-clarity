import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, ChevronRight } from "lucide-react";
import { fetchCourses, fetchUpcoming, fetchAnnouncements } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import type { Course } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList, SkeletonCard } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCourseCode } from "@/lib/format";

function CourseCard({ course, upcomingCount, nextDue }: { 
  course: Course; 
  upcomingCount: number;
  nextDue?: { name: string; due_at: string };
}) {
  return (
    <Link 
      to={`/courses/${course.id}`}
      className="card-interactive p-5 group block"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Course color dot */}
          <div 
            className="w-2.5 h-2.5 rounded-full mb-3"
            style={{ backgroundColor: course.color }}
          />
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
            {course.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">{formatCourseCode(course.course_code)}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <span className={cn(
              "font-medium",
              upcomingCount > 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {upcomingCount} upcoming
            </span>
            {nextDue && (
              <span className="text-muted-foreground truncate">
                Next: {nextDue.name}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const { refreshInterval } = useSettings();
  const { id: courseId } = useParams();

  const { 
    data: courses, 
    isLoading: coursesLoading, 
    error: coursesError,
    refetch: refetchCourses
  } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    refetchInterval: refreshInterval,
  });

  const { data: upcoming } = useQuery({
    queryKey: ["upcoming", "courses"],
    queryFn: () => fetchUpcoming(14),
    refetchInterval: refreshInterval,
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements", courseId],
    queryFn: () => fetchAnnouncements({ days: 14, courseId }),
    enabled: !!courseId,
    refetchInterval: refreshInterval,
  });

  // Get upcoming count and next due for each course
  const getCourseStats = (courseId: string) => {
    if (!upcoming) return { count: 0, nextDue: undefined };
    
    const allAssignments = [
      ...upcoming.overdue,
      ...upcoming.due_today,
      ...upcoming.due_soon,
      ...upcoming.this_week,
    ];
    
    const courseAssignments = allAssignments
      .filter(a => a.course_id === courseId)
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    
    return {
      count: courseAssignments.length,
      nextDue: courseAssignments[0],
    };
  };

  // Course detail view
  if (courseId) {
    const course = courses?.find(c => c.id === courseId);
    const allAssignments = upcoming ? [
      ...upcoming.overdue,
      ...upcoming.due_today,
      ...upcoming.due_soon,
      ...upcoming.this_week,
    ].filter(a => a.course_id === courseId) : [];

    if (coursesLoading) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonCard lines={4} />
          <SkeletonList count={3} />
        </div>
      );
    }

    if (!course) {
      return (
        <div className="max-w-4xl mx-auto">
          <EmptyStateCard type="error" title="Course not found" />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Course Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span className="text-xs text-muted-foreground">{formatCourseCode(course.course_code)}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{course.name}</h1>
          </div>
          <Button
            onClick={() => window.open(course.html_url, "_blank")}
            size="sm"
            className="btn-press"
          >
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Open in Canvas
          </Button>
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Upcoming Assignments
          </h2>
          {allAssignments.length > 0 ? (
            <div className="space-y-2">
              {allAssignments.map((assignment) => (
                <AssignmentCardRow
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard type="caught-up" title="No upcoming assignments" />
          )}
        </motion.section>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recent Announcements
            </h2>
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    );
  }

  // Courses list view
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">Courses</h1>
        <p className="text-muted-foreground">All your enrolled courses.</p>
      </motion.div>

      {/* Error */}
      {coursesError && (
        <ErrorBanner 
          message="Couldn't load courses"
          onRetry={() => refetchCourses()}
        />
      )}

      {/* Course Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.28 }}
      >
        {coursesLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {courses.map((course) => {
              const stats = getCourseStats(course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  upcomingCount={stats.count}
                  nextDue={stats.nextDue}
                />
              );
            })}
          </div>
        ) : (
          <EmptyStateCard type="no-items" title="No courses found" />
        )}
      </motion.div>
    </div>
  );
}
