import * as React from "react";
import { cn } from "@/lib/utils";

interface CoursePillProps {
  name: string;
  color?: string;
  size?: "sm" | "default";
  className?: string;
}

export const CoursePill = React.forwardRef<HTMLSpanElement, CoursePillProps>(
  ({ name, color, size = "default", className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md",
          "font-medium",
          "bg-muted/50 text-muted-foreground border border-border-subtle",
          "transition-colors duration-100",
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
          className
        )}
      >
        {color && (
          <span 
            className={cn(
              "rounded-full flex-shrink-0",
              size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
            )}
            style={{ backgroundColor: color }}
          />
        )}
        <span className={cn("truncate", size === "sm" ? "max-w-[80px]" : "max-w-[120px]")}>{name}</span>
      </span>
    );
  }
);

CoursePill.displayName = "CoursePill";
