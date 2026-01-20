import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, Pin, Sparkles, GraduationCap, Calendar } from "lucide-react";
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
import { FocusSummaryCard } from "@/components/FocusSummaryCard";
import { TimetableCard } from "@/components/TimetableCard";

type FilterType = "all" | "overdue" | "today" | "week" | "done";

export default function HomePage() {
  const { refreshInterval, showAnnouncements, pinnedAssignments, completedAssignments } = useSettings();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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
  const doneItems = allAssignments.filter(a => completedAssignments.includes(a.id));

  // Focus summary counts
  const overdueCount = overdueItems.length;
  const todayCount = todayItems.length;
  const weekCount = weekItems.length;
  const doneCount = doneItems.length;

  // Filtered items based on active filter
  const filteredAssignments = useMemo(() => {
    switch (activeFilter) {
      case "overdue":
        return overdueItems;
      case "today":
        return todayItems;
      case "week":
        return weekItems;
      case "done":
        return doneItems;
      default:
        return null; // null means show all sections
    }
  }, [activeFilter, overdueItems, todayItems, weekItems, doneItems]);

  const showAllSections = activeFilter === "all";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Hero Header - Glass */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="hero-glass p-5"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">
              Home
            </h1>
            <p className="text-sm text-muted-foreground">What you need to focus on right now.</p>
          </div>
          <Sparkles className="w-5 h-5 text-primary/50" />
        </div>
        
        {/* Week Strip at top */}
        <div className="card-matte p-3 mb-4">
          {upcomingLoading ? <SkeletonWeekStrip /> : <WeekStrip assignments={weekItems} />}
        </div>
        
        {/* Focus Summary Chips - clickable filters */}
        {!upcomingLoading && (
          <FocusSummaryCard
            overdueCount={overdueCount}
            todayCount={todayCount}
            weekCount={weekCount}
            doneCount={doneCount}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
      </motion.div>

      {upcomingError && (
        <ErrorBanner message="Couldn't load assignments" onRetry={() => refetchUpcoming()} />
      )}

      {/* Today's Timetable - Full Section */}
      <CollapsibleSection
        title="Today's Schedule"
        icon={<Calendar className="w-3.5 h-3.5 text-primary" />}
        defaultOpen={true}
      >
        <TimetableCard />
      </CollapsibleSection>

      {/* Filtered View */}
      {!showAllSections && filteredAssignments && (
        <CollapsibleSection
          title={activeFilter === "done" ? "Completed" : activeFilter === "week" ? "This Week" : activeFilter === "today" ? "Due Today" : "Overdue"}
          icon={<GraduationCap className="w-3.5 h-3.5 text-primary" />}
          badge={<span className="text-xs text-muted-foreground">({filteredAssignments.length})</span>}
          defaultOpen={true}
        >
          {filteredAssignments.length > 0 ? (
            <div className="space-y-1.5">
              {filteredAssignments.map((a) => (
                <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
              ))}
            </div>
          ) : (
            <EmptyStateCard 
              type="caught-up" 
              title={activeFilter === "done" ? "No completed assignments" : "Nothing here"} 
            />
          )}
        </CollapsibleSection>
      )}

      {/* All Sections View */}
      {showAllSections && (
        <>
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

          {/* Due Today & Tomorrow combined */}
          <CollapsibleSection
            title="Due Soon"
            badge={!upcomingLoading && <span className="text-xs text-muted-foreground">({todayCount + soonItems.length})</span>}
            defaultOpen={true}
          >
            {upcomingLoading ? (
              <SkeletonList count={2} />
            ) : (todayItems.length > 0 || soonItems.length > 0) ? (
              <div className="space-y-1.5">
                {todayItems.map((a) => (
                  <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
                ))}
                {soonItems.map((a) => (
                  <AssignmentCardRow key={a.id} assignment={a} onClick={() => handleAssignmentClick(a)} />
                ))}
              </div>
            ) : (
              <EmptyStateCard type="caught-up" title="Nothing due soon" />
            )}
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
        </>
      )}

      <DetailsDrawer assignment={selectedAssignment} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
