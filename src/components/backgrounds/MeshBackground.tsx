import { memo } from "react";
import { motion } from "framer-motion";

interface MeshBackgroundProps {
  colorShift?: boolean;
}

export const MeshBackground = memo(function MeshBackground({ colorShift = false }: MeshBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Multiple overlapping gradient blobs */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] rounded-full opacity-[0.08]"
        style={{
          background: `radial-gradient(circle at 30% 40%, hsl(var(--primary)) 0%, hsl(280 70% 50%) 50%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-[20%] right-[-15%] w-[55%] h-[65%] rounded-full opacity-[0.06]"
        style={{
          background: `radial-gradient(circle at 60% 50%, hsl(200 80% 50%) 0%, hsl(var(--primary)) 50%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{
          scale: [1, 0.9, 1.1, 1],
          x: [0, -40, 20, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[70%] h-[60%] rounded-full opacity-[0.05]"
        style={{
          background: `radial-gradient(circle at 50% 60%, hsl(320 70% 50%) 0%, hsl(260 60% 50%) 50%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.15, 0.95, 1],
          x: [0, 30, -50, 0],
          y: [0, -50, 30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8,
        }}
      />
      
      <motion.div
        className="absolute top-[50%] left-[40%] w-[40%] h-[50%] rounded-full opacity-[0.04]"
        style={{
          background: `radial-gradient(circle at center, hsl(180 60% 50%) 0%, hsl(var(--primary)) 60%, transparent 80%)`,
          filter: "blur(50px)",
        }}
        animate={{
          scale: [1, 0.85, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Color shift layer */}
      {colorShift && (
        <motion.div
          className="absolute inset-0 mix-blend-overlay"
          animate={{
            background: [
              "linear-gradient(0deg, transparent, hsla(var(--primary), 0.02), transparent)",
              "linear-gradient(90deg, transparent, hsla(280 70% 50% / 0.02), transparent)",
              "linear-gradient(180deg, transparent, hsla(200 80% 50% / 0.02), transparent)",
              "linear-gradient(270deg, transparent, hsla(var(--primary), 0.02), transparent)",
            ],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
});
