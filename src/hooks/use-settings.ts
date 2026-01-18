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
      
      // Setters
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setShowGrades: (showGrades) => set({ showGrades }),
      setShowAnnouncements: (showAnnouncements) => set({ showAnnouncements }),
      setFocusMode: (focusMode) => set({ focusMode }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setDensity: (density) => set({ density }),
      
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
    }),
    {
      name: "canvas-pp-settings",
    }
  )
);
