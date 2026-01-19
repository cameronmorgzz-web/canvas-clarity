import { memo } from "react";

export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Primary orb - top right */}
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-[0.03] animate-float-slow"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        
        {/* Secondary orb - bottom left */}
        <div 
          className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-[0.025] animate-float-slow-reverse"
          style={{
            background: "radial-gradient(circle, hsl(210 60% 50%) 0%, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "-10s",
          }}
        />
        
        {/* Accent orb - center */}
        <div 
          className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full opacity-[0.02] animate-float-drift"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 60%)",
            filter: "blur(60px)",
            animationDelay: "-5s",
          }}
        />
      </div>

      {/* Animated grain/noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)",
          opacity: 0.4,
        }}
      />
    </div>
  );
});
