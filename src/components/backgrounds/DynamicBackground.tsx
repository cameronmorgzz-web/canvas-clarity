import { memo, useEffect, useState } from "react";
import { useVisualSettings } from "@/hooks/use-visual-settings";
import { AuroraBackground } from "./AuroraBackground";
import { ParticleBackground } from "./ParticleBackground";
import { MeshBackground } from "./MeshBackground";
import { GeometricBackground } from "./GeometricBackground";
import { TextureOverlay } from "./TextureOverlay";

export const DynamicBackground = memo(function DynamicBackground() {
  const { 
    backgroundStyle, 
    textureStyle, 
    specialEffects,
    performanceMode,
    reducedMotion 
  } = useVisualSettings();
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  
  const shouldAnimate = !reducedMotion && !prefersReducedMotion;
  
  // In performance mode, only show static background
  const showAnimatedBackground = shouldAnimate && performanceMode !== "performance";
  
  // In performance mode, skip texture overlay
  const showTexture = shouldAnimate && performanceMode !== "performance";

  // The background layer with animations on top
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: 0,
        background: "hsl(var(--background))",
      }}
    >
      {/* Background style */}
      {backgroundStyle === "aurora" && showAnimatedBackground && (
        <AuroraBackground colorShift={specialEffects.colorShift} />
      )}
      
      {backgroundStyle === "particles" && showAnimatedBackground && (
        <ParticleBackground cursorGlow={specialEffects.cursorGlow} />
      )}
      
      {backgroundStyle === "mesh" && showAnimatedBackground && (
        <MeshBackground colorShift={specialEffects.colorShift} />
      )}
      
      {backgroundStyle === "geometric" && showAnimatedBackground && (
        <GeometricBackground parallaxDepth={specialEffects.parallaxDepth} />
      )}
      
      {/* Static fallback for no animation, "none", or performance mode */}
      {(backgroundStyle === "none" || !showAnimatedBackground) && (
        <div className="absolute inset-0">
          <div 
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div 
            className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-[0.025]"
            style={{
              background: "radial-gradient(circle, hsl(210 60% 50%) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>
      )}
      
      {/* Texture overlay */}
      {showTexture && <TextureOverlay style={textureStyle} />}
      
      {/* Vignette effect - subtle */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.6) 100%)",
        }}
      />
    </div>
  );
});
