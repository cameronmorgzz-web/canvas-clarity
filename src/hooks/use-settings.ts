import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/types/canvas";

interface SettingsStore extends Settings {
  setRefreshInterval: (interval: number) => void;
  setShowGrades: (show: boolean) => void;
  setShowAnnouncements: (show: boolean) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      refreshInterval: 60000, // 60 seconds
      showGrades: true,
      showAnnouncements: true,
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setShowGrades: (showGrades) => set({ showGrades }),
      setShowAnnouncements: (showAnnouncements) => set({ showAnnouncements }),
    }),
    {
      name: "canvas-pp-settings",
    }
  )
);
