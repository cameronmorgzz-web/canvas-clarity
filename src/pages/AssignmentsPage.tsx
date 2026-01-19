import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  const { refreshInterval, showGrades, completedAssignments, showCompleted } = useSettings();
  const [searchParams] = useSearchParams();
  
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

    // Filter out completed unless showCompleted is true
    if (!showCompleted) {
      result = result.filter(a => !completedAssignments.includes(a.id));
    }

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
  }, [assignments, search, statusFilter, courseFilter, dueRange, sortBy, completedAssignments, showCompleted]);

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">All your assignments in one place.</p>
      </motion.div>

      {/* Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.28 }}
        className="card-matte p-4 space-y-3 sticky top-14 z-20"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 input-premium text-sm"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
          </div>
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-border-subtle">
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
            <SelectTrigger className="w-32 h-8 text-xs bg-muted/50 border-border-subtle">
              <SelectValue placeholder="Due" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="two_weeks">14 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-muted/50 border-border-subtle">
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

          <div className="flex items-center gap-1.5 ml-auto text-muted-foreground">
            <SortAsc className="w-3.5 h-3.5" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-24 h-8 text-xs bg-muted/50 border-border-subtle">
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
      </motion.div>

      {/* Error */}
      {error && (
        <ErrorBanner 
          message="Couldn't load assignments"
          onRetry={() => refetch()}
        />
      )}

      {/* Results */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
        className="space-y-2"
      >
        {isLoading ? (
          <SkeletonList count={6} />
        ) : filteredAssignments.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
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
      </motion.div>

      {/* Details Drawer */}
      <DetailsDrawer
        assignment={selectedAssignment}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
