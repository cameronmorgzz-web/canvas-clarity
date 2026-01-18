import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, SortAsc } from "lucide-react";
import { fetchAssignments, fetchCourses } from "@/lib/api";
import { useSettings } from "@/hooks/use-settings";
import type { Assignment } from "@/types/canvas";
import { AssignmentCardRow } from "@/components/AssignmentCardRow";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonList } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "not_submitted" | "submitted" | "missing" | "graded";
type DueRange = "today" | "week" | "two_weeks" | "all";
type SortOption = "due" | "course" | "points";

export default function AssignmentsPage() {
  const { refreshInterval, showGrades } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueRange, setDueRange] = useState<DueRange>("two_weeks");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("due");

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: assignments, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ["assignments", statusFilter, courseFilter, dueRange],
    queryFn: () => fetchAssignments({
      status: statusFilter !== "all" ? statusFilter : undefined,
      courseId: courseFilter !== "all" ? courseFilter : undefined,
    }),
    refetchInterval: refreshInterval,
  });

  // Client-side filtering and sorting
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    let result = [...assignments];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.course_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(a => a.submission_state === statusFilter);
    }

    // Course filter
    if (courseFilter !== "all") {
      result = result.filter(a => a.course_id === courseFilter);
    }

    // Due range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dueRange) {
      case "today":
        result = result.filter(a => {
          const due = new Date(a.due_at);
          return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });
        break;
      case "week":
        result = result.filter(a => {
          const due = new Date(a.due_at);
          return due >= today && due < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        });
        break;
      case "two_weeks":
        result = result.filter(a => {
          const due = new Date(a.due_at);
          return due >= today && due < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        });
        break;
    }

    // Sorting
    switch (sortBy) {
      case "due":
        result.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
        break;
      case "course":
        result.sort((a, b) => a.course_name.localeCompare(b.course_name));
        break;
      case "points":
        result.sort((a, b) => (b.points_possible || 0) - (a.points_possible || 0));
        break;
    }

    return result;
  }, [assignments, search, statusFilter, courseFilter, dueRange, sortBy]);

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-content mb-2">Assignments</h1>
        <p className="text-secondary-content">All your assignments in one place.</p>
      </div>

      {/* Filters Bar */}
      <div className="card-matte p-4 space-y-4 sticky top-20 z-20">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border-subtle"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-36 bg-muted/50 border-border-subtle">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dueRange} onValueChange={(v) => setDueRange(v as DueRange)}>
              <SelectTrigger className="w-36 bg-muted/50 border-border-subtle">
                <SelectValue placeholder="Due" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="two_weeks">Next 14 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-40 bg-muted/50 border-border-subtle">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-28 bg-muted/50 border-border-subtle">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due">Due Date</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorBanner 
          message="Couldn't load assignments"
          onRetry={() => refetch()}
        />
      )}

      {/* Results */}
      <div className="space-y-3">
        {isLoading ? (
          <SkeletonList count={6} />
        ) : filteredAssignments.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? "s" : ""}
            </p>
            {filteredAssignments.map((assignment) => (
              <AssignmentCardRow
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
                showGrades={showGrades}
              />
            ))}
          </>
        ) : (
          <EmptyStateCard 
            type="no-items" 
            title="No assignments found"
            description="Try adjusting your filters"
          />
        )}
      </div>

      {/* Details Drawer */}
      <DetailsDrawer
        assignment={selectedAssignment}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
