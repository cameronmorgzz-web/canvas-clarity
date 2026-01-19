import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCourseName } from "@/lib/format";
import type { Announcement } from "@/types/canvas";
import { CoursePill } from "./CoursePill";
import { staggerItem, cardHover, cardTap } from "@/lib/animations";

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
}

export function AnnouncementCard({ announcement, className }: AnnouncementCardProps) {
  return (
    <motion.a
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={cardHover}
      whileTap={cardTap}
      href={announcement.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block card-matte p-4 group relative overflow-hidden",
        className
      )}
    >
      {/* Course color accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-60"
        style={{ backgroundColor: announcement.course_color || "hsl(var(--primary))" }}
      />
      
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CoursePill 
              name={formatCourseName(announcement.course_name)} 
              color={announcement.course_color} 
            />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(announcement.posted_at), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-primary-content truncate mb-1.5 group-hover:text-primary transition-colors duration-200">
            {announcement.title}
          </h3>
          <p className="text-sm text-secondary-content line-clamp-2">
            {announcement.message_preview}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>
    </motion.a>
  );
}
