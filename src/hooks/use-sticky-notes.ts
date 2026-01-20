import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  category: 'todo' | 'in_progress' | 'done';
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export type NoteCategory = 'todo' | 'in_progress' | 'done';

export const NOTE_COLORS = [
  '#fef08a', // yellow
  '#fca5a5', // red
  '#86efac', // green
  '#93c5fd', // blue
  '#c4b5fd', // purple
  '#fdba74', // orange
  '#f9a8d4', // pink
];

export const CATEGORY_LABELS: Record<NoteCategory, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function useStickyNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as StickyNote[]) || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load sticky notes',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create note
  const createNote = useCallback(async (note: Partial<StickyNote>) => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert({
          title: note.title || '',
          content: note.content || '',
          color: note.color || NOTE_COLORS[0],
          category: note.category || 'todo',
          position_x: note.position_x || Math.random() * 200,
          position_y: note.position_y || Math.random() * 200,
        })
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [data as StickyNote, ...prev]);
      return data as StickyNote;
    } catch (err) {
      console.error('Error creating note:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create note',
      });
      return null;
    }
  }, [toast]);

  // Update note
  const updateNote = useCallback(async (id: string, updates: Partial<StickyNote>) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setNotes(prev =>
        prev.map(note => (note.id === id ? { ...note, ...updates } : note))
      );
    } catch (err) {
      console.error('Error updating note:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update note',
      });
    }
  }, [toast]);

  // Delete note
  const deleteNote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: 'Note deleted',
        description: 'Sticky note removed',
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete note',
      });
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('sticky_notes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sticky_notes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => {
              const exists = prev.some(n => n.id === (payload.new as StickyNote).id);
              if (exists) return prev;
              return [payload.new as StickyNote, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev =>
              prev.map(note =>
                note.id === (payload.new as StickyNote).id
                  ? (payload.new as StickyNote)
                  : note
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev =>
              prev.filter(note => note.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
