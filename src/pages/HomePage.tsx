import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { SkeletonList, SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-content mb-2">Home</h1>
        <p className="text-secondary-content">What you need to focus on right now.</p>
      </div>

      {/* Error Banner */}
      {upcomingError && (
        <ErrorBanner 
          message="Couldn't load assignments"
          onRetry={() => refetchUpcoming()}
        />
      )}

      {/* Overdue Section */}
      {!upcomingLoading && upcoming?.overdue && upcoming.overdue.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-status-overdue" />
            <h2 className="text-lg font-semibold text-primary-content">Overdue</h2>
            <span className="status-overdue px-2 py-0.5 rounded-full text-xs font-semibold">
              {upcoming.overdue.length}
            </span>
          </div>
          <div className="space-y-3">
            {upcoming.overdue.map((assignment) => (
              <AssignmentCardRow
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Due Today Section */}
      <section className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-status-today" />
          <h2 className="text-lg font-semibold text-primary-content">Due Today</h2>
          {!upcomingLoading && upcoming?.due_today && (
            <span className="status-today px-2 py-0.5 rounded-full text-xs font-semibold">
              {upcoming.due_today.length}
            </span>
          )}
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_today && upcoming.due_today.length > 0 ? (
          <div className="space-y-3">
            {upcoming.due_today.map((assignment) => (
              <AssignmentCardRow
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="caught-up" title="Nothing due today" />
        )}
      </section>

      {/* Next Up (48 hours) Section */}
      <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-status-soon" />
          <h2 className="text-lg font-semibold text-primary-content">Next Up</h2>
          <span className="text-sm text-muted-foreground">(48 hours)</span>
        </div>
        {upcomingLoading ? (
          <SkeletonList count={2} />
        ) : upcoming?.due_soon && upcoming.due_soon.length > 0 ? (
          <div className="space-y-3">
            {upcoming.due_soon.map((assignment) => (
              <AssignmentCardRow
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </div>
        ) : (
          <EmptyStateCard type="no-items" description="Nothing due in the next 48 hours" />
        )}
      </section>

      {/* This Week Strip */}
      <section className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-primary-content">This Week</h2>
        </div>
        {upcomingLoading ? (
          <div className="skeleton-shimmer h-24 rounded-xl" />
        ) : (
          <div className="card-matte p-4">
            <WeekStrip assignments={allThisWeek} />
          </div>
        )}
      </section>

      {/* Announcements Section */}
      {showAnnouncements && (
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary-content">Announcements</h2>
          </div>
          {announcementsError && (
            <ErrorBanner 
              message="Couldn't load announcements"
              onRetry={() => refetchAnnouncements()}
            />
          )}
          {announcementsLoading ? (
            <SkeletonList count={3} />
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.slice(0, 5).map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <EmptyStateCard type="no-items" title="No new announcements" />
          )}
        </section>
      )}

      {/* Details Drawer */}
      <DetailsDrawer
        assignment={selectedAssignment}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
