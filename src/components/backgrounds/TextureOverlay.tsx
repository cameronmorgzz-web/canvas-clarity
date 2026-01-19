import { memo } from "react";
import { TextureStyle } from "@/hooks/use-visual-settings";

interface TextureOverlayProps {
  style: TextureStyle;
}

// Pre-rendered grain texture as base64 (256x256 PNG) - static, no animation
const GRAIN_TEXTURE = "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E";

export const TextureOverlay = memo(function TextureOverlay({ style }: TextureOverlayProps) {
  if (style === "none") return null;

  if (style === "grain") {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${GRAIN_TEXTURE}")`,
          backgroundRepeat: "repeat",
          opacity: 0.022,
          contain: "strict",
          contentVisibility: "auto",
        }}
      />
    );
  }

  if (style === "dots") {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary)) 0.5px, transparent 0.5px)`,
          backgroundSize: "16px 16px",
          opacity: 0.025,
          contain: "strict",
          contentVisibility: "auto",
        }}
      />
    );
  }

  if (style === "mesh") {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(60deg, transparent 25%, hsl(var(--primary) / 0.06) 25.5%, hsl(var(--primary) / 0.06) 26%, transparent 26.5%),
            linear-gradient(-60deg, transparent 25%, hsl(var(--primary) / 0.06) 25.5%, hsl(var(--primary) / 0.06) 26%, transparent 26.5%),
            linear-gradient(60deg, transparent 74%, hsl(var(--primary) / 0.06) 74.5%, hsl(var(--primary) / 0.06) 75%, transparent 75.5%),
            linear-gradient(-60deg, transparent 74%, hsl(var(--primary) / 0.06) 74.5%, hsl(var(--primary) / 0.06) 75%, transparent 75.5%)
          `,
          backgroundSize: "40px 70px",
          opacity: 0.018,
          contain: "strict",
          contentVisibility: "auto",
        }}
      />
    );
  }

  return null;
});
