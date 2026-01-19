import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DensityMode = "comfort" | "compact";

interface SettingsStore {
  // Display settings
  refreshInterval: number;
  showGrades: boolean;
  showAnnouncements: boolean;
  
  // New luxury features
  focusMode: boolean;
  density: DensityMode;
  pinnedAssignments: string[]; // Array of assignment IDs
  completedAssignments: string[]; // Array of completed assignment IDs
  showCompleted: boolean; // Whether to show completed in list views
  
  // Actions
  setRefreshInterval: (interval: number) => void;
  setShowGrades: (show: boolean) => void;
  setShowAnnouncements: (show: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  toggleFocusMode: () => void;
  setDensity: (density: DensityMode) => void;
  pinAssignment: (id: string) => void;
  unpinAssignment: (id: string) => void;
  togglePinAssignment: (id: string) => void;
  isPinned: (id: string) => boolean;
  completeAssignment: (id: string) => void;
  uncompleteAssignment: (id: string) => void;
  toggleCompleteAssignment: (id: string) => void;
  isCompleted: (id: string) => boolean;
  setShowCompleted: (show: boolean) => void;
}

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
      
      // Setters
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
    }),
    {
      name: "canvas-pp-settings",
    }
  )
);
