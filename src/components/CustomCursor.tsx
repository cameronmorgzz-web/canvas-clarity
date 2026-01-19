import { useEffect, useState, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCursor } from "@/hooks/use-cursor";
import "./custom-cursor.css";

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  rect: DOMRect;
  borderRadius: string;
}

const MAX_RIPPLES = 3;

export function CustomCursor() {
  const isMobile = useIsMobile();
  const { isCustomCursorEnabled } = useCursor();
  const [cursorState, setCursorState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  const rippleIdRef = useRef(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });

  // Smooth cursor animation using RAF with lerp
  const animateCursor = useCallback(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const glow = glowRef.current;
    
    if (cursor && dot) {
      // Lerp factor for smooth following
      const cursorLerp = 0.15;
      const dotLerp = 0.25;
      
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * cursorLerp;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * cursorLerp;
      
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * dotLerp;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * dotLerp;
      
      cursor.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) translate(-50%, -50%)`;
      dot.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      
      // Glow follows the cursor ring position
      if (glow) {
        glow.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) translate(-50%, -50%)`;
      }
    }
    
    rafRef.current = requestAnimationFrame(animateCursor);
  }, []);

  useEffect(() => {
    if (isMobile || !isCustomCursorEnabled) {
      // Restore default cursor
      document.body.style.cursor = "";
      document.getElementById("custom-cursor-style")?.remove();
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Throttled mouse move (every 16ms = ~60fps)
    let lastMouseTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseTime < 16) return;
      lastMouseTime = now;
      
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseDown = (e: MouseEvent) => {
      setCursorState((prev) => ({ ...prev, isClicking: true }));
      
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], .clickable, [data-clickable]");
      
      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const borderRadius = window.getComputedStyle(interactive).borderRadius;
        
        const id = rippleIdRef.current++;
        
        setRipples((prev) => {
          const newRipples = [...prev, { id, x, y, rect, borderRadius }];
          // Limit concurrent ripples
          if (newRipples.length > MAX_RIPPLES) {
            return newRipples.slice(-MAX_RIPPLES);
          }
          return newRipples;
        });
        
        // Clean up ripple after CSS animation completes
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 500);
      }
    };

    const handleMouseUp = () => {
      setCursorState((prev) => ({ ...prev, isClicking: false }));
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [role='button'], .clickable, input, textarea, select, [data-clickable]");
      setCursorState((prev) => ({ ...prev, isHovering: !!interactive }));
    };

    // Start animation loop
    rafRef.current = requestAnimationFrame(animateCursor);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Hide default cursor globally
    document.body.style.cursor = "none";
    
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = `
      *, *::before, *::after { 
        cursor: none !important; 
      }
      html, body {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "";
      document.getElementById("custom-cursor-style")?.remove();
    };
  }, [isMobile, isCustomCursorEnabled, animateCursor]);

  if (isMobile || !isCustomCursorEnabled) return null;

  const cursorClass = `custom-cursor-ring ${cursorState.isHovering ? "hovering" : ""} ${cursorState.isClicking ? "clicking" : ""} ${isVisible ? "visible" : ""}`;
  const dotClass = `custom-cursor-dot ${cursorState.isHovering ? "hovering" : ""} ${cursorState.isClicking ? "clicking" : ""} ${isVisible ? "visible" : ""}`;
  const glowClass = `custom-cursor-glow ${cursorState.isHovering ? "hovering" : ""} ${isVisible ? "visible" : ""}`;

  return (
    <>
      {/* Glow effect - follows the ring */}
      <div ref={glowRef} className={glowClass} />
      
      {/* Main cursor ring */}
      <div ref={cursorRef} className={cursorClass} />
      
      {/* Inner dot */}
      <div ref={dotRef} className={dotClass} />

      {/* CSS-animated ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="cursor-ripple-container"
          style={{
            left: ripple.rect.left,
            top: ripple.rect.top,
            width: ripple.rect.width,
            height: ripple.rect.height,
            borderRadius: ripple.borderRadius,
          }}
        >
          <div
            className="cursor-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: Math.max(ripple.rect.width, ripple.rect.height) * 2.5,
              height: Math.max(ripple.rect.width, ripple.rect.height) * 2.5,
            }}
          />
        </div>
      ))}
    </>
  );
}
