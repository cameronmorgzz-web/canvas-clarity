import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Clock, Megaphone } from "lucide-react";
import { fetchUpcoming, fetchAnnouncements } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import type { Assignment } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { WeekStrip } from "@/components/WeekStrip";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList, SkeletonWeekStrip } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import { iosEase, staggerContainer } from "@/lib/animations";

export default function HomePage() {
  const { refreshInterval, showAnnouncements } = useSettings();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { 
    data: upcoming, 
    isLoading: upcomingLoading, 
    error: upcomingError,
    refetch: refetchUpcoming
  } = useQuery({
    queryKey: ["upcoming"],
    queryFn: () => fetchUpcoming(14),
    refetchInterval: refreshInterval,
  });

  const {
    data: announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetchAnnouncements({ days: 14 }),
    refetchInterval: refreshInterval,
    enabled: showAnnouncements,
  });

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  const allThisWeek = [
    ...(upcoming?.overdue || []),
    ...(upcoming?.due_today || []),
    ...(upcoming?.due_soon || []),
    ...(upcoming?.this_week || []),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: iosEase }}
      >
        <h1 className="text-4xl font-bold text-primary-content mb-2 tracking-tight">Home</h1>
        <p className="text-secondary-content text-lg">What you need to focus on right now.</p>
      </motion.div>

      {upcomingError && (
        <ErrorBanner message="Couldn't load assignments" onRetry={() => refetchUpcoming()} />
      )}

      {/* Overdue Section */}
      {!upcomingLoading && upcoming?.overdue && upcoming.overdue.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: iosEase }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-status-overdue" />
            <h2 className="text-xl font-bold text-primary-content">Overdue</h2>
            <span className="status-overdue px-2.5 py-0.5 rounded-full text-xs font-bold">
              {upcoming.overdue.length}
            </span>
          </div>
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {upcoming.overdue.map((assignment) => (
              <AssignmentCardRow
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Due Today */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: iosEase }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-status-today" />
          <h2 className="text-xl font-bold text-primary-content">Due Today</h2>
          {!upcomingLoading && upcoming?.due_today && (
            <span className="status-today px-2.5 py-0.5 rounded-full text-xs font-bold">
              {upcoming.due_today.length}
            </span>
          )}
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_today && upcoming.due_today.length > 0 ? (
          <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
            {upcoming.due_today.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </motion.div>
        ) : (
          <EmptyStateCard type="caught-up" title="Nothing due today" />
        )}
      </motion.section>

      {/* Next Up */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: iosEase }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-status-soon" />
          <h2 className="text-xl font-bold text-primary-content">Next Up</h2>
          <span className="text-sm text-muted-foreground">(48 hours)</span>
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_soon && upcoming.due_soon.length > 0 ? (
          <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
            {upcoming.due_soon.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </motion.div>
        ) : (
          <EmptyStateCard type="no-items" description="Nothing due in the next 48 hours" />
        )}
      </motion.section>

      {/* This Week */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: iosEase }}
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-primary-content">This Week</h2>
        </div>
        <div className="card-matte p-4">
          {upcomingLoading ? <SkeletonWeekStrip /> : <WeekStrip assignments={allThisWeek} />}
        </div>
      </motion.section>

      {/* Announcements */}
      {showAnnouncements && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: iosEase }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary-content">Announcements</h2>
          </div>
          {announcementsError && (
            <ErrorBanner message="Couldn't load announcements" onRetry={() => refetchAnnouncements()} />
          )}
          {announcementsLoading ? (
            <SkeletonList count={3} />
          ) : announcements && announcements.length > 0 ? (
            <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {announcements.slice(0, 5).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </motion.div>
          ) : (
            <EmptyStateCard type="no-items" title="No new announcements" />
          )}
        </motion.section>
      )}

      <DetailsDrawer assignment={selectedAssignment} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
