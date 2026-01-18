import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function NavigationProgress() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start navigation animation
    setIsNavigating(true);
    setProgress(0);

    // Animate progress
    const timer1 = setTimeout(() => setProgress(60), 50);
    const timer2 = setTimeout(() => setProgress(80), 150);
    const timer3 = setTimeout(() => setProgress(100), 250);
    const timer4 = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[100] h-0.5"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/50"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px hsl(var(--primary) / 0.5), 0 0 5px hsl(var(--primary) / 0.3)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
