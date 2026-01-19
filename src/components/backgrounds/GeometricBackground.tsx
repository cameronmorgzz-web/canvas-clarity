import { memo } from "react";
import "./geometric.css";

interface GeometricBackgroundProps {
  parallaxDepth?: boolean;
}

export const GeometricBackground = memo(function GeometricBackground({ parallaxDepth = false }: GeometricBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden geometric-container">
      {/* Animated wave lines - CSS only */}
      <svg
        className={`geometric-waves ${parallaxDepth ? "geometric-parallax" : ""}`}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="geo-gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="geo-gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(280 70% 50%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280 70% 50%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="geo-gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(200 80% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(200 80% 50%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(200 80% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <path
          className="geometric-line geometric-line-1"
          d="M0,540 Q480,440 960,540 T1920,540"
          fill="none"
          stroke="url(#geo-gradient1)"
          strokeWidth="2"
        />
        <path
          className="geometric-line geometric-line-2"
          d="M0,300 Q480,220 960,300 T1920,300"
          fill="none"
          stroke="url(#geo-gradient2)"
          strokeWidth="1.5"
        />
        <path
          className="geometric-line geometric-line-3"
          d="M0,780 Q480,700 960,780 T1920,780"
          fill="none"
          stroke="url(#geo-gradient3)"
          strokeWidth="1"
        />
      </svg>
      
      {/* Floating geometric shapes */}
      <div className={`geometric-shape geometric-shape-square ${parallaxDepth ? "geometric-parallax-shape" : "geometric-rotate"}`} />
      <div className={`geometric-shape geometric-shape-circle ${parallaxDepth ? "geometric-parallax-shape-alt" : "geometric-pulse"}`} />
      <div className={`geometric-shape geometric-shape-diamond ${parallaxDepth ? "geometric-parallax-shape" : "geometric-rotate"}`} />
      
      {/* Subtle grid overlay */}
      <div className={`geometric-grid ${parallaxDepth ? "geometric-grid-parallax" : ""}`} />
    </div>
  );
});
