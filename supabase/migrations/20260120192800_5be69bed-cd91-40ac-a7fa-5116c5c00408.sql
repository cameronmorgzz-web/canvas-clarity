-- Create sticky notes table for the notes wall
CREATE TABLE public.sticky_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#fef08a',
  category TEXT NOT NULL DEFAULT 'todo',
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations since we don't have auth
-- In production, you'd want to add user_id and proper policies
CREATE POLICY "Allow all operations on sticky_notes" 
ON public.sticky_notes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sticky_notes_updated_at
BEFORE UPDATE ON public.sticky_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for sticky notes
ALTER PUBLICATION supabase_realtime ADD TABLE public.sticky_notes;