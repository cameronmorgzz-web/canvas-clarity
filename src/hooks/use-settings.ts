import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DensityMode = "comfort" | "compact";
export type Priority = "low" | "medium" | "high";
export type PersonalStatus = "planned" | "started" | "done";

export interface TaskMetadata {
  priority: Priority;
  personalStatus: PersonalStatus;
  notes: string;
}

interface SettingsStore {
  // Display settings
  refreshInterval: number;
  showGrades: boolean;
  showAnnouncements: boolean;
  
  // Luxury features
  focusMode: boolean;
  density: DensityMode;
  pinnedAssignments: string[];
  completedAssignments: string[];
  showCompleted: boolean;
  
  // Task metadata (per assignment)
  assignmentMetadata: Record<string, TaskMetadata>;
  
  // AI Assistant privacy settings
  aiCanSeeDescriptions: boolean;
  aiCanSeeAnnouncements: boolean;
  
  // Actions - Display
  setRefreshInterval: (interval: number) => void;
  setShowGrades: (show: boolean) => void;
  setShowAnnouncements: (show: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  toggleFocusMode: () => void;
  setDensity: (density: DensityMode) => void;
  setShowCompleted: (show: boolean) => void;
  
  // Actions - Pinned
  pinAssignment: (id: string) => void;
  unpinAssignment: (id: string) => void;
  togglePinAssignment: (id: string) => void;
  isPinned: (id: string) => boolean;
  
  // Actions - Completed
  completeAssignment: (id: string) => void;
  uncompleteAssignment: (id: string) => void;
  toggleCompleteAssignment: (id: string) => void;
  isCompleted: (id: string) => boolean;
  
  // Actions - Task Metadata
  setAssignmentMeta: (id: string, meta: Partial<TaskMetadata>) => void;
  getAssignmentMeta: (id: string) => TaskMetadata;
  setAssignmentPriority: (id: string, priority: Priority) => void;
  setAssignmentStatus: (id: string, status: PersonalStatus) => void;
  setAssignmentNotes: (id: string, notes: string) => void;
  
  // Actions - AI Privacy
  setAiCanSeeDescriptions: (value: boolean) => void;
  setAiCanSeeAnnouncements: (value: boolean) => void;
  
  // Actions - Utilities
  clearAllData: () => void;
}

const DEFAULT_METADATA: TaskMetadata = {
  priority: "medium",
  personalStatus: "planned",
  notes: "",
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Defaults
      refreshInterval: 60000,
      showGrades: true,
      showAnnouncements: true,
      focusMode: false,
      density: "comfort",
      pinnedAssignments: [],
      completedAssignments: [],
      showCompleted: false,
      assignmentMetadata: {},
      aiCanSeeDescriptions: true,
      aiCanSeeAnnouncements: true,
      
      // Display settings
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setShowGrades: (showGrades) => set({ showGrades }),
      setShowAnnouncements: (showAnnouncements) => set({ showAnnouncements }),
      setFocusMode: (focusMode) => set({ focusMode }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setDensity: (density) => set({ density }),
      setShowCompleted: (showCompleted) => set({ showCompleted }),
      
      // Pinned assignments
      pinAssignment: (id) => set((state) => ({
        pinnedAssignments: state.pinnedAssignments.includes(id) 
          ? state.pinnedAssignments 
          : [...state.pinnedAssignments, id]
      })),
      unpinAssignment: (id) => set((state) => ({
        pinnedAssignments: state.pinnedAssignments.filter((i) => i !== id)
      })),
      togglePinAssignment: (id) => set((state) => ({
        pinnedAssignments: state.pinnedAssignments.includes(id)
          ? state.pinnedAssignments.filter((i) => i !== id)
          : [...state.pinnedAssignments, id]
      })),
      isPinned: (id) => get().pinnedAssignments.includes(id),
      
      // Completed assignments
      completeAssignment: (id) => set((state) => ({
        completedAssignments: state.completedAssignments.includes(id)
          ? state.completedAssignments
          : [...state.completedAssignments, id]
      })),
      uncompleteAssignment: (id) => set((state) => ({
        completedAssignments: state.completedAssignments.filter((i) => i !== id)
      })),
      toggleCompleteAssignment: (id) => set((state) => ({
        completedAssignments: state.completedAssignments.includes(id)
          ? state.completedAssignments.filter((i) => i !== id)
          : [...state.completedAssignments, id]
      })),
      isCompleted: (id) => get().completedAssignments.includes(id),
      
      // Task metadata
      setAssignmentMeta: (id, meta) => set((state) => ({
        assignmentMetadata: {
          ...state.assignmentMetadata,
          [id]: {
            ...DEFAULT_METADATA,
            ...state.assignmentMetadata[id],
            ...meta,
          },
        },
      })),
      getAssignmentMeta: (id) => {
        const state = get();
        return state.assignmentMetadata[id] || { ...DEFAULT_METADATA };
      },
      setAssignmentPriority: (id, priority) => {
        const state = get();
        state.setAssignmentMeta(id, { priority });
      },
      setAssignmentStatus: (id, personalStatus) => {
        const state = get();
        state.setAssignmentMeta(id, { personalStatus });
      },
      setAssignmentNotes: (id, notes) => {
        const state = get();
        state.setAssignmentMeta(id, { notes });
      },
      
      // AI Privacy
      setAiCanSeeDescriptions: (aiCanSeeDescriptions) => set({ aiCanSeeDescriptions }),
      setAiCanSeeAnnouncements: (aiCanSeeAnnouncements) => set({ aiCanSeeAnnouncements }),
      
      // Utilities
      clearAllData: () => set({
        pinnedAssignments: [],
        completedAssignments: [],
        assignmentMetadata: {},
      }),
    }),
    {
      name: "canvas-pp-settings",
    }
  )
);
