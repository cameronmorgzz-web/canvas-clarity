import { create } from "zustand";

interface CursorStore {
  isCustomCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;
}

export const useCursor = create<CursorStore>((set) => ({
  isCustomCursorEnabled: true,
  setCustomCursorEnabled: (enabled) => set({ isCustomCursorEnabled: enabled }),
}));
