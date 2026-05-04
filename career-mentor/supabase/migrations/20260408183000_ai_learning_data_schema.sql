-- AI learning data schema: roadmaps, milestones, goals, chat, exams, certificates

-- Core roadmap tables
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal_summary TEXT NOT NULL,
  estimated_duration TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, order_index)
);

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'exam_ready', 'passed')),
  exam_score INTEGER CHECK (exam_score >= 0 AND exam_score <= 100),
  depends_on UUID[] NOT NULL DEFAULT '{}',
  parallel_with UUID[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL,
  is_final BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, order_index)
);

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exams
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  selected_index INTEGER CHECK (selected_index >= 0 AND selected_index <= 3),
  order_index INTEGER NOT NULL
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  roadmap_title TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_xp INTEGER NOT NULL DEFAULT 0,
  milestone_count INTEGER NOT NULL DEFAULT 0,
  final_exam_score INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, roadmap_id)
);

-- Indexes
CREATE INDEX idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX idx_sections_roadmap_id ON public.sections(roadmap_id);
CREATE INDEX idx_milestones_roadmap_id ON public.milestones(roadmap_id);
CREATE INDEX idx_goals_milestone_id ON public.goals(milestone_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_milestone_id ON public.chat_messages(milestone_id);
CREATE INDEX idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_milestone_id ON public.exam_attempts(milestone_id);
CREATE INDEX idx_exam_questions_attempt_id ON public.exam_questions(attempt_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);

-- Updated-at trigger for roadmaps
CREATE OR REPLACE FUNCTION public.update_roadmaps_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION public.update_roadmaps_updated_at();

-- Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Roadmaps policies
CREATE POLICY "roadmaps_select_own"
ON public.roadmaps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "roadmaps_insert_own"
ON public.roadmaps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmaps_update_own"
ON public.roadmaps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmaps_delete_own"
ON public.roadmaps FOR DELETE
USING (auth.uid() = user_id);

-- Sections policies
CREATE POLICY "sections_all_via_own_roadmap"
ON public.sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = sections.roadmap_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = sections.roadmap_id
      AND r.user_id = auth.uid()
  )
);

-- Milestones policies
CREATE POLICY "milestones_all_via_own_roadmap"
ON public.milestones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = milestones.roadmap_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = milestones.roadmap_id
      AND r.user_id = auth.uid()
  )
);

-- Goals policies
CREATE POLICY "goals_all_via_own_milestone"
ON public.goals FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.roadmaps r ON r.id = m.roadmap_id
    WHERE m.id = goals.milestone_id
      AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.milestones m
    JOIN public.roadmaps r ON r.id = m.roadmap_id
    WHERE m.id = goals.milestone_id
      AND r.user_id = auth.uid()
  )
);

-- Chat messages policies
CREATE POLICY "chat_messages_select_own"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_insert_own"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages_update_own"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages_delete_own"
ON public.chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- Exam attempts policies
CREATE POLICY "exam_attempts_select_own"
ON public.exam_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "exam_attempts_insert_own"
ON public.exam_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exam_attempts_update_own"
ON public.exam_attempts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exam_attempts_delete_own"
ON public.exam_attempts FOR DELETE
USING (auth.uid() = user_id);

-- Exam questions policies
CREATE POLICY "exam_questions_all_via_own_attempt"
ON public.exam_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = exam_questions.attempt_id
      AND ea.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = exam_questions.attempt_id
      AND ea.user_id = auth.uid()
  )
);

-- Certificates policies
CREATE POLICY "certificates_select_own"
ON public.certificates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "certificates_insert_own"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "certificates_update_own"
ON public.certificates FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "certificates_delete_own"
ON public.certificates FOR DELETE
USING (auth.uid() = user_id);
