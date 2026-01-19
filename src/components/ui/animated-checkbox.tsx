import * as React from "react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const colors = [
  "hsl(var(--primary))",
  "hsl(152 60% 48%)",
  "hsl(40 85% 52%)",
  "hsl(268 65% 58%)",
  "hsl(212 100% 62%)",
];

export function AnimatedCheckbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  size = "default",
}: AnimatedCheckboxProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    default: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  const handleClick = useCallback(() => {
    if (disabled) return;

    const newChecked = !checked;
    onCheckedChange?.(newChecked);

    if (newChecked) {
      // Create celebration particles
      setIsAnimating(true);
      const newParticles: Particle[] = [];
      const particleCount = 12;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Date.now() + i,
          angle: (360 / particleCount) * i + Math.random() * 15,
          distance: 20 + Math.random() * 25,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setParticles(newParticles);

      // Cleanup particles after animation
      setTimeout(() => {
        setParticles([]);
        setIsAnimating(false);
      }, 600);
    }
  }, [checked, disabled, onCheckedChange]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.8],
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1],
            }}
          />
        ))}
      </AnimatePresence>

      {/* Ring burst effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute rounded-full border-2 pointer-events-none"
            style={{ borderColor: "hsl(var(--primary))" }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 40, height: 40, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Checkbox */}
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative rounded-[5px] border-2 transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked
            ? "bg-primary border-primary"
            : "bg-transparent border-border-bright hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          sizeClasses[size],
          className
        )}
        whileTap={{ scale: 0.9 }}
        animate={
          checked
            ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
              }
            : {}
        }
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            >
              <Check className={cn("text-primary-foreground", iconSizes[size])} strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
