import { cn } from "@/lib/utils";

interface CoursePillProps {
  name: string;
  color?: string;
  className?: string;
}

export function CoursePill({ name, color, className }: CoursePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        "bg-muted text-muted-foreground",
        className
      )}
      style={color ? { 
        backgroundColor: `${color}20`, 
        color: color,
      } : undefined}
    >
      {name}
    </span>
  );
}
