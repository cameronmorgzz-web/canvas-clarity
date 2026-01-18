import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types/canvas";
import { CoursePill } from "./CoursePill";

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
}

export function AnnouncementCard({ announcement, className }: AnnouncementCardProps) {
  return (
    <a
      href={announcement.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block card-interactive p-4 group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <CoursePill 
              name={announcement.course_name} 
              color={announcement.course_color} 
            />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(announcement.posted_at), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-medium text-primary-content truncate mb-1 group-hover:text-primary transition-colors">
            {announcement.title}
          </h3>
          <p className="text-sm text-secondary-content line-clamp-2">
            {announcement.message_preview}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
}
