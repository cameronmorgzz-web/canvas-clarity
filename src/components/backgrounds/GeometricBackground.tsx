import { memo } from "react";
import { motion } from "framer-motion";

interface GeometricBackgroundProps {
  parallaxDepth?: boolean;
}

export const GeometricBackground = memo(function GeometricBackground({ parallaxDepth = false }: GeometricBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated wave lines - Layer 1 */}
      <motion.svg
        className="absolute w-full h-full opacity-[0.04]"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        animate={parallaxDepth ? { y: [-10, 10, -10] } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.path
          d="M0,540 Q480,400 960,540 T1920,540"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          animate={{
            d: [
              "M0,540 Q480,400 960,540 T1920,540",
              "M0,540 Q480,680 960,540 T1920,540",
              "M0,540 Q480,400 960,540 T1920,540",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,300 Q480,200 960,300 T1920,300"
          fill="none"
          stroke="url(#gradient2)"
          strokeWidth="1.5"
          animate={{
            d: [
              "M0,300 Q480,200 960,300 T1920,300",
              "M0,300 Q480,400 960,300 T1920,300",
              "M0,300 Q480,200 960,300 T1920,300",
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.path
          d="M0,780 Q480,680 960,780 T1920,780"
          fill="none"
          stroke="url(#gradient3)"
          strokeWidth="1"
          animate={{
            d: [
              "M0,780 Q480,680 960,780 T1920,780",
              "M0,780 Q480,880 960,780 T1920,780",
              "M0,780 Q480,680 960,780 T1920,780",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(280 70% 50%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(280 70% 50%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(200 80% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(200 80% 50%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(200 80% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      {/* Floating geometric shapes - Layer 2 */}
      <motion.div
        className="absolute top-[10%] left-[15%] w-32 h-32 border border-primary/5 rounded-xl opacity-60"
        animate={parallaxDepth ? {
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          rotate: [0, 5, -5, 0],
        } : {
          rotate: [0, 360],
        }}
        transition={{ duration: parallaxDepth ? 25 : 60, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute top-[60%] right-[20%] w-24 h-24 border border-primary/[0.03] rounded-full"
        animate={parallaxDepth ? {
          y: [20, -20, 20],
          x: [10, -10, 10],
          scale: [1, 1.1, 1],
        } : {
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      
      <motion.div
        className="absolute bottom-[20%] left-[30%] w-16 h-16 border border-primary/[0.04]"
        style={{ transform: "rotate(45deg)" }}
        animate={parallaxDepth ? {
          y: [-15, 15, -15],
          rotate: [45, 50, 40, 45],
        } : {
          rotate: [45, 405],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Subtle grid overlay - Layer 3 */}
      <motion.div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
        animate={parallaxDepth ? { y: [-5, 5, -5] } : {}}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
});
