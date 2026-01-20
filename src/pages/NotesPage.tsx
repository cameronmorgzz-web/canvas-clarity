import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { NotesWall } from "@/components/NotesWall";

export default function NotesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="hero-glass p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 tracking-tight">
              Notes Wall
            </h1>
            <p className="text-sm text-muted-foreground">
              Organize your thoughts with draggable sticky notes.
            </p>
          </div>
          <StickyNote className="w-5 h-5 text-primary/50" />
        </div>
      </motion.div>

      {/* Notes Wall - Full Width */}
      <div className="card-matte p-4">
        <NotesWall />
      </div>
    </div>
  );
}
