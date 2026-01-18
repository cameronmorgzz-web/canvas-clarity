import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { iosEase, cardHover, cardTap } from "@/lib/animations";
import { forwardRef } from "react";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: "default" | "interactive" | "glass";
  isOverdue?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, children, variant = "interactive", isOverdue, ...props }, ref) => {
    const baseStyles = {
      default: "card-matte",
      interactive: "card-matte cursor-pointer",
      glass: "glass",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
          },
        }}
        whileHover={cardHover}
        whileTap={cardTap}
        className={cn(
          baseStyles[variant],
          "transition-colors duration-200",
          isOverdue && "card-overdue",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = "MotionCard";
