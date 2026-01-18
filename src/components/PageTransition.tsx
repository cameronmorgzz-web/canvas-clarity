import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition, staggerContainer, iosEase } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.35,
          ease: iosEase,
        },
      }}
      exit={{ 
        opacity: 0, 
        y: -8,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
