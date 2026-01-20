import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, GripVertical, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { StickyNote as StickyNoteType, NoteCategory } from '@/hooks/use-sticky-notes';
import { NOTE_COLORS, CATEGORY_LABELS } from '@/hooks/use-sticky-notes';

interface StickyNoteProps {
  note: StickyNoteType;
  onUpdate: (id: string, updates: Partial<StickyNoteType>) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function StickyNote({ note, onUpdate, onDelete, containerRef }: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    if (containerRef.current && noteRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const noteRect = noteRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container
      let newX = note.position_x + info.offset.x;
      let newY = note.position_y + info.offset.y;
      
      // Keep within bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - noteRect.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - noteRect.height));
      
      onUpdate(note.id, { position_x: newX, position_y: newY });
    }
  };

  // Calculate text color based on background brightness
  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1f2937' : '#f9fafb';
  };

  const textColor = getContrastColor(note.color);

  return (
    <motion.div
      ref={noteRef}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: note.position_x,
        y: note.position_y,
      }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "absolute w-48 min-h-[160px] rounded-lg shadow-lg p-3 flex flex-col gap-2",
        "cursor-grab active:cursor-grabbing",
        isDragging && "shadow-2xl"
      )}
      style={{ 
        backgroundColor: note.color,
        color: textColor,
        left: 0,
        top: 0,
      }}
    >
      {/* Header with drag handle and actions */}
      <div className="flex items-center justify-between gap-1">
        <GripVertical className="h-4 w-4 opacity-40 flex-shrink-0" />
        
        <div className="flex items-center gap-0.5">
          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-60 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <Palette className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                      note.color === color ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdate(note.id, { color })}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-60 hover:opacity-100 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <Input
        value={note.title}
        onChange={(e) => onUpdate(note.id, { title: e.target.value })}
        placeholder="Title..."
        className="border-none bg-transparent p-0 h-auto text-sm font-semibold placeholder:opacity-50 focus-visible:ring-0"
        style={{ color: textColor }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Content */}
      <Textarea
        value={note.content}
        onChange={(e) => onUpdate(note.id, { content: e.target.value })}
        placeholder="Write something..."
        className="border-none bg-transparent p-0 text-xs resize-none flex-1 min-h-[60px] placeholder:opacity-50 focus-visible:ring-0"
        style={{ color: textColor }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Category selector */}
      <Select
        value={note.category}
        onValueChange={(value: NoteCategory) => onUpdate(note.id, { category: value })}
      >
        <SelectTrigger 
          className="h-6 text-xs border-none bg-black/10 focus:ring-0"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(CATEGORY_LABELS) as [NoteCategory, string][]).map(([value, label]) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
