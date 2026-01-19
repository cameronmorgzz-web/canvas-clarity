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
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { refreshInterval, showAnnouncements, pinnedAssignments, completedAssignments } = useSettings();
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

  // Filter out completed assignments
  const filterCompleted = (assignments: Assignment[]) => 
    assignments.filter(a => !completedAssignments.includes(a.id));

  const allAssignments = [
    ...(upcoming?.overdue || []),
    ...(upcoming?.due_today || []),
    ...(upcoming?.due_soon || []),
    ...(upcoming?.this_week || []),
  ];

  // Get pinned assignments (excluding completed)
  const pinnedItems = filterCompleted(allAssignments.filter(a => pinnedAssignments.includes(a.id)));

  // Filter completed from each section
  const overdueItems = filterCompleted(upcoming?.overdue || []);
  const todayItems = filterCompleted(upcoming?.due_today || []);
  const soonItems = filterCompleted(upcoming?.due_soon || []);
  const weekItems = filterCompleted(allAssignments);

  // Focus summary counts (excluding completed)
  const overdueCount = overdueItems.length;
  const todayCount = todayItems.length;
  const weekCount = weekItems.length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hero Header - Glass */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="hero-glass p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">
              Home
            </h1>
            <p className="text-sm text-muted-foreground">What you need to focus on right now.</p>
          </div>
          <Sparkles className="w-5 h-5 text-primary/50" />
        </div>
        
        {/* Focus Summary Chips */}
        {!upcomingLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="flex flex-wrap gap-1.5 mt-4"
          >
            {overdueCount > 0 && (
              <motion.span 
                className="focus-chip focus-chip-urgent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {overdueCount} overdue
              </motion.span>
            )}
            <motion.span 
              className={cn("focus-chip", todayCount > 0 && "focus-chip-today")}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
            >
              <Clock className="w-2.5 h-2.5" />
              {todayCount} due today
            </motion.span>
            <motion.span 
              className="focus-chip"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <CalendarDays className="w-2.5 h-2.5" />
              {weekCount} this week
            </motion.span>
          </motion.div>
        )}
      </motion.div>

      {upcomingError && (
        <ErrorBanner message="Couldn't load assignments" onRetry={() => refetchUpcoming()} />
      )}

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <CollapsibleSection
          title="Pinned"
          icon={<Pin className="w-3.5 h-3.5 text-primary" />}
          defaultOpen={true}
        >
          <div className="space-y-1.5">
            {pinnedItems.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Overdue Section */}
      {!upcomingLoading && overdueItems.length > 0 && (
        <CollapsibleSection
          title="Overdue"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-status-overdue" />}
          badge={<span className="status-overdue">{overdueItems.length}</span>}
          defaultOpen={true}
        >
          <div className="space-y-1.5">
            {overdueItems.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Due Today */}
      <CollapsibleSection
        title="Due Today"
        icon={<Clock className="w-3.5 h-3.5 text-status-today" />}
        badge={!upcomingLoading && <span className="status-today">{todayItems.length}</span>}
        defaultOpen={true}
      >
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : todayItems.length > 0 ? (
          <div className="space-y-1.5">
            {todayItems.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="caught-up" title="Nothing due today" />
        )}
      </CollapsibleSection>

      {/* Next Up */}
      <CollapsibleSection
        title="Next Up"
        icon={<Clock className="w-3.5 h-3.5 text-status-soon" />}
        badge={<span className="text-[10px] text-muted-foreground">(48h)</span>}
        defaultOpen={true}
      >
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : soonItems.length > 0 ? (
          <div className="space-y-1.5">
            {soonItems.map((a) => (
              <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="no-items" description="Nothing due in the next 48 hours" />
        )}
      </CollapsibleSection>

      {/* This Week */}
      <CollapsibleSection
        title="This Week"
        icon={<CalendarDays className="w-3.5 h-3.5 text-primary" />}
        defaultOpen={true}
      >
        <div className="card-matte p-3">
          {upcomingLoading ? <SkeletonWeekStrip /> : <WeekStrip assignments={weekItems} />}
        </div>
      </CollapsibleSection>

      {/* Announcements */}
      {showAnnouncements && (
        <CollapsibleSection
          title="Announcements"
          icon={<Megaphone className="w-3.5 h-3.5 text-primary" />}
          defaultOpen={false}
        >
          {announcementsError && (
            <ErrorBanner message="Couldn't load announcements" onRetry={() => refetchAnnouncements()} />
          )}
          {announcementsLoading ? (
            <SkeletonList count={2} />
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-1.5">
              {announcements.slice(0, 3).map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            </div>
          ) : (
            <EmptyStateCard type="no-items" title="No new announcements" />
          )}
        </CollapsibleSection>
      )}

      <DetailsDrawer assignment={selectedAssignment} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
