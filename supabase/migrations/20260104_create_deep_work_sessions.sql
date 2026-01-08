-- Create Deep Work Sessions table for tracking focus sessions

CREATE TABLE IF NOT EXISTS public.deep_work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL, -- How long the session was
  mode TEXT NOT NULL DEFAULT 'work', -- 'work' or 'break'
  completed BOOLEAN DEFAULT false, -- Did they complete the full session?
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS
ALTER TABLE public.deep_work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own deep work sessions" 
  ON public.deep_work_sessions 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS deep_work_sessions_user_date_idx 
  ON public.deep_work_sessions(user_id, date DESC);

COMMENT ON TABLE public.deep_work_sessions IS 'Tracks deep work/focus sessions completed by users';
