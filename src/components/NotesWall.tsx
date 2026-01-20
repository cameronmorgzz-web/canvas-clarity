import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, StickyNote as StickyNoteIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StickyNote } from '@/components/StickyNote';
import { useStickyNotes, CATEGORY_LABELS, NoteCategory, NOTE_COLORS } from '@/hooks/use-sticky-notes';
import { cn } from '@/lib/utils';

export function NotesWall() {
  const { notes, isLoading, createNote, updateNote, deleteNote } = useStickyNotes();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddNote = async (category: NoteCategory = 'todo') => {
    // Position new notes with some offset based on category
    const categoryIndex = Object.keys(CATEGORY_LABELS).indexOf(category);
    const baseX = categoryIndex * 220 + 20;
    const existingInCategory = notes.filter(n => n.category === category).length;
    
    await createNote({
      category,
      position_x: baseX + (existingInCategory % 3) * 30,
      position_y: 80 + (existingInCategory % 5) * 40,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    });
  };

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    const category = note.category as NoteCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(note);
    return acc;
  }, {} as Record<NoteCategory, typeof notes>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Notes Wall</h2>
          <Badge variant="secondary" className="text-xs">
            {notes.length} notes
          </Badge>
        </div>
        <Button onClick={() => handleAddNote('todo')} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Category labels */}
      <div className="flex gap-4 border-b border-border/50 pb-2">
        {(Object.entries(CATEGORY_LABELS) as [NoteCategory, string][]).map(([category, label]) => {
          const count = notesByCategory[category]?.length || 0;
          return (
            <button
              key={category}
              onClick={() => handleAddNote(category)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{label}</span>
              <Badge variant="outline" className="text-xs px-1.5 min-w-[20px] justify-center">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Notes container */}
      <motion.div
        ref={containerRef}
        className="relative min-h-[500px] rounded-xl border-2 border-dashed border-border/50 bg-muted/20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Background grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Loading state */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <StickyNoteIcon className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">No notes yet</p>
            <p className="text-xs opacity-70">Click "Add Note" to create your first sticky note</p>
          </div>
        ) : (
          /* Render all notes */
          notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              containerRef={containerRef}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}
