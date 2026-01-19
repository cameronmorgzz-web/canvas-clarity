import { create } from "zustand";
import { persist } from "zustand/middleware";

// Background style options
export type BackgroundStyle = "aurora" | "particles" | "mesh" | "geometric" | "none";

// Texture overlay options  
export type TextureStyle = "grain" | "dots" | "mesh" | "none";

// Glass effect intensity
export type GlassIntensity = "heavy" | "medium" | "light" | "layered";

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
  
  // Performance mode (reduces effects on lower-end devices)
  reducedMotion: boolean;
  
  // Actions
  setBackgroundStyle: (style: BackgroundStyle) => void;
  setTextureStyle: (style: TextureStyle) => void;
  setGlassIntensity: (intensity: GlassIntensity) => void;
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

export const useVisualSettings = create<VisualSettingsStore>()(
  persist(
    (set) => ({
      // Defaults
      backgroundStyle: "aurora",
      textureStyle: "grain",
      glassIntensity: "medium",
      specialEffects: { ...DEFAULT_EFFECTS },
      reducedMotion: false,
      
      // Actions
      setBackgroundStyle: (backgroundStyle) => set({ backgroundStyle }),
      setTextureStyle: (textureStyle) => set({ textureStyle }),
      setGlassIntensity: (glassIntensity) => set({ glassIntensity }),
      
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
        specialEffects: { ...DEFAULT_EFFECTS },
        reducedMotion: false,
      }),
    }),
    {
      name: "canvas-pp-visual-settings",
    }
  )
);
