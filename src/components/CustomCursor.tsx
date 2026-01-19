import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  element: HTMLElement | null;
}

export function CustomCursor() {
  const isMobile = useIsMobile();
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    element: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = useRef(0);

  // Mouse position with physics-based spring
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for weighted cursor feel
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Inner dot follows more closely
  const dotConfig = { stiffness: 300, damping: 20, mass: 0.05 };
  const dotX = useSpring(mouseX, dotConfig);
  const dotY = useSpring(mouseY, dotConfig);

  useEffect(() => {
    if (isMobile) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setCursorState((prev) => ({ ...prev, isClicking: true }));
      
      // Create ripple at click position on interactive elements
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], .clickable, [data-clickable]");
      
      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const id = rippleIdRef.current++;
        setRipples((prev) => [...prev, { id, x, y }]);
        
        // Clean up ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
    };

    const handleMouseUp = () => {
      setCursorState((prev) => ({ ...prev, isClicking: false }));
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], .clickable, input, textarea, select, [data-clickable]");
      
      if (interactive) {
        setCursorState((prev) => ({ 
          ...prev, 
          isHovering: true, 
          element: interactive as HTMLElement 
        }));
      } else {
        setCursorState((prev) => ({ 
          ...prev, 
          isHovering: false, 
          element: null 
        }));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);

    // Hide default cursor
    document.body.style.cursor = "none";
    
    // Add style to hide cursor on all elements
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "";
      document.getElementById("custom-cursor-style")?.remove();
    };
  }, [isMobile, mouseX, mouseY]);

  // Don't render on mobile or if reduced motion is preferred
  if (isMobile) return null;

  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: cursorState.isClicking ? 0.8 : cursorState.isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          opacity: { duration: 0.15 },
        }}
      >
        <div
          className={`
            w-8 h-8 rounded-full border-2 
            transition-colors duration-200
            ${cursorState.isHovering 
              ? "border-white bg-white/10" 
              : "border-white/60"
            }
            ${cursorState.isClicking ? "bg-white/20" : ""}
          `}
          style={{
            boxShadow: cursorState.isHovering 
              ? "0 0 20px rgba(255,255,255,0.3), inset 0 0 10px rgba(255,255,255,0.1)" 
              : "0 0 10px rgba(255,255,255,0.1)",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: cursorState.isClicking ? 0.5 : cursorState.isHovering ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: "spring", stiffness: 500, damping: 28 },
          opacity: { duration: 0.15 },
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </motion.div>

      {/* Ripple container - rendered into a portal-like fixed layer */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} element={cursorState.element} />
        ))}
      </AnimatePresence>
    </>
  );
}

interface RippleEffectProps {
  x: number;
  y: number;
  element: HTMLElement | null;
}

function RippleEffect({ x, y, element }: RippleEffectProps) {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  
  return (
    <motion.div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        overflow: "hidden",
        borderRadius: window.getComputedStyle(element).borderRadius,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="absolute rounded-full bg-white/30"
        style={{
          left: x,
          top: y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ width: 0, height: 0, opacity: 0.6 }}
        animate={{ 
          width: Math.max(rect.width, rect.height) * 2.5, 
          height: Math.max(rect.width, rect.height) * 2.5,
          opacity: 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.div>
  );
}
