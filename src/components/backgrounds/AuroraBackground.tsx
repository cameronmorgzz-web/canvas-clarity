import { memo } from "react";
import { motion } from "framer-motion";

interface AuroraBackgroundProps {
  colorShift?: boolean;
}

export const AuroraBackground = memo(function AuroraBackground({ colorShift = false }: AuroraBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary aurora wave */}
      <motion.div
        className="absolute -top-[50%] -left-[25%] w-[150%] h-[100%] opacity-[0.07]"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(var(--primary)) 0%,
            hsl(280 70% 50%) 25%,
            hsl(200 80% 50%) 50%,
            hsl(var(--primary)) 75%,
            hsl(320 70% 50%) 100%
          )`,
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.1, 0.95, 1],
          rotate: colorShift ? [0, 10, -5, 0] : 0,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Secondary aurora wave */}
      <motion.div
        className="absolute -bottom-[30%] -right-[20%] w-[120%] h-[80%] opacity-[0.05]"
        style={{
          background: `linear-gradient(
            -45deg,
            hsl(180 60% 50%) 0%,
            hsl(var(--primary)) 40%,
            hsl(260 70% 60%) 70%,
            hsl(200 80% 50%) 100%
          )`,
          filter: "blur(120px)",
          borderRadius: "40%",
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, 30, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
      
      {/* Tertiary accent glow */}
      <motion.div
        className="absolute top-[30%] left-[20%] w-[60%] h-[50%] opacity-[0.04]"
        style={{
          background: `radial-gradient(
            ellipse at center,
            hsl(var(--primary)) 0%,
            hsl(280 60% 50%) 40%,
            transparent 70%
          )`,
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -40, 60, 0],
          opacity: [0.04, 0.06, 0.03, 0.04],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />
      
      {/* Color shift overlay */}
      {colorShift && (
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          animate={{
            background: [
              "linear-gradient(45deg, hsl(var(--primary)) 0%, transparent 100%)",
              "linear-gradient(135deg, hsl(280 70% 50%) 0%, transparent 100%)",
              "linear-gradient(225deg, hsl(200 80% 50%) 0%, transparent 100%)",
              "linear-gradient(315deg, hsl(var(--primary)) 0%, transparent 100%)",
            ],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
});
