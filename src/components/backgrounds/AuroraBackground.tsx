import { memo } from "react";
import "./aurora.css";

interface AuroraBackgroundProps {
  colorShift?: boolean;
}

export const AuroraBackground = memo(function AuroraBackground({ colorShift = false }: AuroraBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden aurora-container">
      {/* Primary aurora wave - CSS animation */}
      <div 
        className={`aurora-wave aurora-wave-primary ${colorShift ? "aurora-color-shift" : ""}`}
      />
      
      {/* Secondary aurora wave */}
      <div className="aurora-wave aurora-wave-secondary" />
      
      {/* Tertiary accent glow */}
      <div className="aurora-wave aurora-wave-tertiary" />
      
      {/* Color shift overlay */}
      {colorShift && (
        <div className="aurora-color-overlay" />
      )}
    </div>
  );
});
