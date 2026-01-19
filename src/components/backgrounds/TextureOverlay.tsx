import { memo } from "react";
import { TextureStyle } from "@/hooks/use-visual-settings";

interface TextureOverlayProps {
  style: TextureStyle;
}

// Pre-rendered grain texture as SVG
const GRAIN_TEXTURE = "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E";

export const TextureOverlay = memo(function TextureOverlay({ style }: TextureOverlayProps) {
  if (style === "none") return null;

  if (style === "grain") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("${GRAIN_TEXTURE}")`,
          backgroundRepeat: "repeat",
          opacity: 0.035,
        }}
      />
    );
  }

  if (style === "dots") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary)) 0.5px, transparent 0.5px)`,
          backgroundSize: "16px 16px",
          opacity: 0.04,
        }}
      />
    );
  }

  if (style === "mesh") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(60deg, transparent 25%, hsl(var(--primary) / 0.08) 25.5%, hsl(var(--primary) / 0.08) 26%, transparent 26.5%),
            linear-gradient(-60deg, transparent 25%, hsl(var(--primary) / 0.08) 25.5%, hsl(var(--primary) / 0.08) 26%, transparent 26.5%),
            linear-gradient(60deg, transparent 74%, hsl(var(--primary) / 0.08) 74.5%, hsl(var(--primary) / 0.08) 75%, transparent 75.5%),
            linear-gradient(-60deg, transparent 74%, hsl(var(--primary) / 0.08) 74.5%, hsl(var(--primary) / 0.08) 75%, transparent 75.5%)
          `,
          backgroundSize: "40px 70px",
          opacity: 0.03,
        }}
      />
    );
  }

  return null;
});
