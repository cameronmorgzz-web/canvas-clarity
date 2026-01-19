import { create } from "zustand";
import { persist } from "zustand/middleware";

// Background style options
export type BackgroundStyle = "aurora" | "particles" | "mesh" | "geometric" | "none";

// Texture overlay options  
export type TextureStyle = "grain" | "dots" | "mesh" | "none";

// Glass effect intensity
export type GlassIntensity = "heavy" | "medium" | "light" | "layered";

// Performance mode
export type PerformanceMode = "quality" | "balanced" | "performance";

// Special effects
export interface SpecialEffects {
  cursorGlow: boolean;
  reactiveRipples: boolean;
  parallaxDepth: boolean;
  colorShift: boolean;
}

interface VisualSettingsStore {
  // Visual options
  backgroundStyle: BackgroundStyle;
  textureStyle: TextureStyle;
  glassIntensity: GlassIntensity;
  specialEffects: SpecialEffects;
  performanceMode: PerformanceMode;
  
  // Performance mode (reduces effects on lower-end devices)
  reducedMotion: boolean;
  
  // Actions
  setBackgroundStyle: (style: BackgroundStyle) => void;
  setTextureStyle: (style: TextureStyle) => void;
  setGlassIntensity: (intensity: GlassIntensity) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  setSpecialEffect: (effect: keyof SpecialEffects, enabled: boolean) => void;
  toggleSpecialEffect: (effect: keyof SpecialEffects) => void;
  setReducedMotion: (reduced: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_EFFECTS: SpecialEffects = {
  cursorGlow: true,
  reactiveRipples: true,
  parallaxDepth: false,
  colorShift: false,
};

// Auto-detect low-end devices
const detectPerformanceMode = (): PerformanceMode => {
  if (typeof window === "undefined") return "balanced";
  
  // Check for low memory (< 4GB)
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (memory && memory < 4) return "performance";
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return "performance";
  
  // Check for battery saver
  if ("getBattery" in navigator) {
    (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> })
      .getBattery?.()
      .then((battery) => {
        if (battery.level < 0.2 && !battery.charging) {
          // Would trigger a state update, but we'll just default to balanced
        }
      })
      .catch(() => {});
  }
  
  return "balanced";
};

export const useVisualSettings = create<VisualSettingsStore>()(
  persist(
    (set) => ({
      // Defaults
      backgroundStyle: "aurora",
      textureStyle: "grain",
      glassIntensity: "medium",
      performanceMode: detectPerformanceMode(),
      specialEffects: { ...DEFAULT_EFFECTS },
      reducedMotion: false,
      
      // Actions
      setBackgroundStyle: (backgroundStyle) => set({ backgroundStyle }),
      setTextureStyle: (textureStyle) => set({ textureStyle }),
      setGlassIntensity: (glassIntensity) => set({ glassIntensity }),
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      
      setSpecialEffect: (effect, enabled) => set((state) => ({
        specialEffects: {
          ...state.specialEffects,
          [effect]: enabled,
        },
      })),
      
      toggleSpecialEffect: (effect) => set((state) => ({
        specialEffects: {
          ...state.specialEffects,
          [effect]: !state.specialEffects[effect],
        },
      })),
      
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      
      resetToDefaults: () => set({
        backgroundStyle: "aurora",
        textureStyle: "grain",
        glassIntensity: "medium",
        performanceMode: "balanced",
        specialEffects: { ...DEFAULT_EFFECTS },
        reducedMotion: false,
      }),
    }),
    {
      name: "canvas-pp-visual-settings",
    }
  )
);
