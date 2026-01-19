import { memo } from "react";
import { motion } from "framer-motion";
import { TextureStyle } from "@/hooks/use-visual-settings";

interface TextureOverlayProps {
  style: TextureStyle;
}

export const TextureOverlay = memo(function TextureOverlay({ style }: TextureOverlayProps) {
  if (style === "none") return null;

  if (style === "grain") {
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          opacity: 0.025,
        }}
        animate={{
          x: [0, -5, 3, -2, 0],
          y: [0, 3, -5, 2, 0],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    );
  }

  if (style === "dots") {
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--primary)) 0.5px, transparent 0.5px)`,
          backgroundSize: "16px 16px",
        }}
        animate={{
          opacity: [0.03, 0.04, 0.03],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (style === "mesh") {
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(60deg, transparent 25%, hsl(var(--primary) / 0.08) 25.5%, hsl(var(--primary) / 0.08) 26%, transparent 26.5%),
            linear-gradient(-60deg, transparent 25%, hsl(var(--primary) / 0.08) 25.5%, hsl(var(--primary) / 0.08) 26%, transparent 26.5%),
            linear-gradient(60deg, transparent 74%, hsl(var(--primary) / 0.08) 74.5%, hsl(var(--primary) / 0.08) 75%, transparent 75.5%),
            linear-gradient(-60deg, transparent 74%, hsl(var(--primary) / 0.08) 74.5%, hsl(var(--primary) / 0.08) 75%, transparent 75.5%)
          `,
          backgroundSize: "40px 70px",
        }}
        animate={{
          opacity: [0.02, 0.025, 0.02],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  return null;
});
