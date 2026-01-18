import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Clock, Megaphone, Pin, Sparkles } from "lucide-react";
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

export default function HomePage() {
  const { refreshInterval, showAnnouncements, pinnedAssignments } = useSettings();
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

  const allAssignments = [
    ...(upcoming?.overdue || []),
    ...(upcoming?.due_today || []),
    ...(upcoming?.due_soon || []),
    ...(upcoming?.this_week || []),
  ];

  // Get pinned assignments
  const pinnedItems = allAssignments.filter(a => pinnedAssignments.includes(a.id));

  // Focus summary counts
  const overdueCount = upcoming?.overdue?.length || 0;
  const todayCount = upcoming?.due_today?.length || 0;
  const weekCount = allAssignments.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Header - Glass */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="hero-glass"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">
              Home
            </h1>
            <p className="text-muted-foreground">What you need to focus on right now.</p>
          </div>
          <Sparkles className="w-6 h-6 text-primary/50" />
        </div>
        
        {/* Focus Summary Chips */}
        {!upcomingLoading && (
          <div className="flex flex-wrap gap-2 mt-5">
            {overdueCount > 0 && (
              <span className="focus-chip focus-chip-urgent">
                <AlertTriangle className="w-3 h-3" />
                {overdueCount} overdue
              </span>
            )}
            <span className={cn("focus-chip", todayCount > 0 && "focus-chip-today")}>
              <Clock className="w-3 h-3" />
              {todayCount} due today
            </span>
            <span className="focus-chip">
              <CalendarDays className="w-3 h-3" />
              {weekCount} this week
            </span>
          </div>
        )}
      </motion.div>

      {upcomingError && (
        <ErrorBanner message="Couldn't load assignments" onRetry={() => refetchUpcoming()} />
      )}

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Overdue Section */}
      {!upcomingLoading && upcoming?.overdue && upcoming.overdue.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.28 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-status-overdue" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Overdue</h2>
            <span className="status-overdue ml-1">{upcoming.overdue.length}</span>
          </div>
          <div className="space-y-2">
            {upcoming.overdue.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Due Today */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.28 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-status-today" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Due Today</h2>
          {!upcomingLoading && upcoming?.due_today && (
            <span className="status-today ml-1">{upcoming.due_today.length}</span>
          )}
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_today && upcoming.due_today.length > 0 ? (
          <div className="space-y-2">
            {upcoming.due_today.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="caught-up" title="Nothing due today" />
        )}
      </motion.section>

      {/* Next Up */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.28 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-status-soon" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Next Up</h2>
          <span className="text-xs text-muted-foreground">(48 hours)</span>
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_soon && upcoming.due_soon.length > 0 ? (
          <div className="space-y-2">
            {upcoming.due_soon.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="no-items" description="Nothing due in the next 48 hours" />
        )}
      </motion.section>

      {/* This Week */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">This Week</h2>
        </div>
        <div className="card-matte p-4">
          {upcomingLoading ? <SkeletonWeekStrip /> : <WeekStrip assignments={allAssignments} />}
        </div>
      </motion.section>

      {/* Announcements */}
      {showAnnouncements && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.28 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Announcements</h2>
          </div>
          {announcementsError && (
            <ErrorBanner message="Couldn't load announcements" onRetry={() => refetchAnnouncements()} />
          )}
          {announcementsLoading ? (
            <SkeletonList count={3} />
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-2">
              {announcements.slice(0, 5).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </div>
          ) : (
            <EmptyStateCard type="no-items" title="No new announcements" />
          )}
        </motion.section>
      )}

      <DetailsDrawer assignment={selectedAssignment} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
