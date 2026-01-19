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

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Background style */}
      {backgroundStyle === "aurora" && shouldAnimate && (
        <AuroraBackground colorShift={specialEffects.colorShift} />
      )}
      
      {backgroundStyle === "particles" && shouldAnimate && (
        <ParticleBackground cursorGlow={specialEffects.cursorGlow} />
      )}
      
      {backgroundStyle === "mesh" && shouldAnimate && (
        <MeshBackground colorShift={specialEffects.colorShift} />
      )}
      
      {backgroundStyle === "geometric" && shouldAnimate && (
        <GeometricBackground parallaxDepth={specialEffects.parallaxDepth} />
      )}
      
      {/* Static fallback for no animation or "none" */}
      {(backgroundStyle === "none" || !shouldAnimate) && (
        <div className="absolute inset-0">
          <div 
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div 
            className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-[0.025]"
            style={{
              background: "radial-gradient(circle, hsl(210 60% 50%) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>
      )}
      
      {/* Texture overlay */}
      {shouldAnimate && <TextureOverlay style={textureStyle} />}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
});
