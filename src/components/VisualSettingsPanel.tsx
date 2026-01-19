import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Grid3X3, 
  Waves, 
  Circle, 
  MousePointer2, 
  Droplets, 
  Layers, 
  Palette,
  Gauge,
  RotateCcw
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  useVisualSettings, 
  BackgroundStyle, 
  TextureStyle, 
  GlassIntensity 
} from "@/hooks/use-visual-settings";
import { cn } from "@/lib/utils";

const BACKGROUND_OPTIONS: { value: BackgroundStyle; label: string; icon: React.ElementType; description: string }[] = [
  { value: "aurora", label: "Aurora", icon: Waves, description: "Flowing northern lights" },
  { value: "particles", label: "Particles", icon: Sparkles, description: "Floating connected dots" },
  { value: "mesh", label: "Gradient Mesh", icon: Circle, description: "Morphing color blobs" },
  { value: "geometric", label: "Geometric", icon: Grid3X3, description: "Animated lines & shapes" },
  { value: "none", label: "Minimal", icon: Circle, description: "Static subtle gradients" },
];

const TEXTURE_OPTIONS: { value: TextureStyle; label: string; description: string }[] = [
  { value: "grain", label: "Film Grain", description: "Vintage noise overlay" },
  { value: "dots", label: "Dot Matrix", description: "Subtle halftone pattern" },
  { value: "mesh", label: "Honeycomb", description: "Geometric mesh pattern" },
  { value: "none", label: "None", description: "Clean, no texture" },
];

const GLASS_OPTIONS: { value: GlassIntensity; label: string; description: string }[] = [
  { value: "heavy", label: "Heavy Frost", description: "Maximum blur (48px)" },
  { value: "medium", label: "Medium Glass", description: "Balanced blur (24px)" },
  { value: "light", label: "Light Tint", description: "Subtle blur (12px)" },
  { value: "layered", label: "Layered", description: "Multi-depth glassmorphism" },
];

const EFFECT_OPTIONS: { key: "cursorGlow" | "reactiveRipples" | "parallaxDepth" | "colorShift"; label: string; icon: React.ElementType; description: string }[] = [
  { key: "cursorGlow", label: "Cursor Glow", icon: MousePointer2, description: "Light trail following cursor" },
  { key: "reactiveRipples", label: "Reactive Ripples", icon: Droplets, description: "Click ripple effects" },
  { key: "parallaxDepth", label: "Parallax Depth", icon: Layers, description: "Background depth on scroll" },
  { key: "colorShift", label: "Color Shift", icon: Palette, description: "Slowly cycling hues" },
];

export const VisualSettingsPanel = memo(function VisualSettingsPanel() {
  const {
    backgroundStyle,
    setBackgroundStyle,
    textureStyle,
    setTextureStyle,
    glassIntensity,
    setGlassIntensity,
    specialEffects,
    toggleSpecialEffect,
    reducedMotion,
    setReducedMotion,
    resetToDefaults,
  } = useVisualSettings();

  return (
    <div className="space-y-6">
      {/* Background Style */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.28 }}
        className="card-matte p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Background Animation
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BACKGROUND_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setBackgroundStyle(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                  backgroundStyle === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border-subtle bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground">
          {BACKGROUND_OPTIONS.find((o) => o.value === backgroundStyle)?.description}
        </p>
      </motion.section>

      {/* Texture Style */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
        className="card-matte p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Texture Overlay
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          {TEXTURE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTextureStyle(option.value)}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all duration-200 text-left",
                textureStyle === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border-subtle bg-muted/30 hover:border-border hover:bg-muted/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                textureStyle === option.value ? "text-foreground" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
              <span className="text-2xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Glass Intensity */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
        className="card-matte p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Glass Effect Intensity
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          {GLASS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setGlassIntensity(option.value)}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all duration-200 text-left",
                glassIntensity === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border-subtle bg-muted/30 hover:border-border hover:bg-muted/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                glassIntensity === option.value ? "text-foreground" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
              <span className="text-2xs text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Special Effects */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
        className="card-matte p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Special Effects
        </h2>
        
        <div className="space-y-3">
          {EFFECT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const key = option.key as keyof typeof specialEffects;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="font-medium text-foreground text-sm cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-2xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <Switch
                  checked={specialEffects[key]}
                  onCheckedChange={() => toggleSpecialEffect(key)}
                />
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Performance */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
        className="card-matte p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Performance
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <Label className="font-medium text-foreground text-sm">
                Reduced Motion
              </Label>
              <p className="text-2xs text-muted-foreground">Disable animations for performance</p>
            </div>
          </div>
          <Switch
            checked={reducedMotion}
            onCheckedChange={setReducedMotion}
          />
        </div>
        
        <div className="section-divider" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="w-full"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Reset to Defaults
        </Button>
      </motion.section>
    </div>
  );
});
