import { memo, useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  cellKey?: string;
}

interface ParticleBackgroundProps {
  cursorGlow?: boolean;
}

// Spatial partitioning cell size (matches connection distance)
const CELL_SIZE = 120;
const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS;

// Get cell key for spatial hashing
const getCellKey = (x: number, y: number): string => 
  `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`;

// Get neighboring cell keys (including current)
const getNeighborKeys = (x: number, y: number): string[] => {
  const cx = Math.floor(x / CELL_SIZE);
  const cy = Math.floor(y / CELL_SIZE);
  const keys: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      keys.push(`${cx + dx},${cy + dy}`);
    }
  }
  return keys;
};

export const ParticleBackground = memo(function ParticleBackground({ cursorGlow = false }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);
  const spatialGridRef = useRef<Map<string, Particle[]>>(new Map());
  const resizeTimeoutRef = useRef<number>();
  const primaryColorRef = useRef("60, 130, 246"); // Fallback blue

  // Extract primary color from CSS on mount
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const primary = computedStyle.getPropertyValue("--primary").trim();
    if (primary) {
      // Convert HSL to approximate RGB for canvas
      const [h, s, l] = primary.split(" ").map((v) => parseFloat(v));
      if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
        // Simple HSL to RGB approximation
        const hue = h / 360;
        const sat = s / 100;
        const light = l / 100;
        const c = (1 - Math.abs(2 * light - 1)) * sat;
        const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
        const m = light - c / 2;
        let r = 0, g = 0, b = 0;
        if (hue < 1/6) { r = c; g = x; }
        else if (hue < 2/6) { r = x; g = c; }
        else if (hue < 3/6) { g = c; b = x; }
        else if (hue < 4/6) { g = x; b = c; }
        else if (hue < 5/6) { r = x; b = c; }
        else { r = c; b = x; }
        primaryColorRef.current = `${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}`;
      }
    }
  }, []);

  const updateSpatialGrid = useCallback((particles: Particle[]) => {
    const grid = spatialGridRef.current;
    grid.clear();
    
    for (const p of particles) {
      const key = getCellKey(p.x, p.y);
      p.cellKey = key;
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(p);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      // Reduced particle count for performance (~60 on 1080p)
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 35000);
      particlesRef.current = Array.from({ length: Math.min(particleCount, 80) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.25 + 0.1,
      }));
      updateSpatialGrid(particlesRef.current);
    };

    // Throttled mouse move handler
    let lastMouseUpdate = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseUpdate < 16) return; // ~60fps cap for mouse
      lastMouseUpdate = now;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = (time: number) => {
      // FPS limiting - only render at target FPS
      if (time - lastFrameTimeRef.current < FRAME_TIME) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = time;

      if (!ctx || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Clear with single call
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const grid = spatialGridRef.current;
      const color = primaryColorRef.current;

      // Batch particle updates
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;
      }

      // Update spatial grid after all movements
      updateSpatialGrid(particles);

      // Draw all particles first - more visible
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections using spatial partitioning (O(n) instead of O(n²))
      ctx.lineWidth = 0.5;
      const drawnConnections = new Set<string>();
      
      for (const p of particles) {
        const neighborKeys = getNeighborKeys(p.x, p.y);
        
        for (const key of neighborKeys) {
          const cellParticles = grid.get(key);
          if (!cellParticles) continue;
          
          for (const p2 of cellParticles) {
            if (p === p2) continue;
            
            // Create unique connection ID to avoid duplicates
            const connId = p.x < p2.x ? `${p.x},${p.y}-${p2.x},${p2.y}` : `${p2.x},${p2.y}-${p.x},${p.y}`;
            if (drawnConnections.has(connId)) continue;
            
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 14400) { // 120^2
              const dist = Math.sqrt(distSq);
              const alpha = 0.08 * (1 - dist / 120);
              ctx.strokeStyle = `rgba(${color}, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              drawnConnections.add(connId);
            }
          }
        }
      }

      // Cursor glow effect (simplified)
      if (cursorGlow && mouse.x && mouse.y) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        gradient.addColorStop(0, `rgba(${color}, 0.15)`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - 150, mouse.y - 150, 300, 300);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animationRef.current = requestAnimationFrame(animate);

    // Debounced resize handler
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 250);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorGlow, updateSpatialGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
});
