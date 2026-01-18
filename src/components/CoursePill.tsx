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
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md",
        "text-[11px] font-medium",
        "bg-muted/50 text-muted-foreground border border-border-subtle",
        "transition-colors duration-120",
        className
      )}
    >
      {color && (
        <span 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="truncate max-w-[120px]">{name}</span>
    </span>
  );
}
