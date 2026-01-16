-- Tabela de matérias (subjects)
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tópicos (topics)
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  last_score_percent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de revisão (review_logs)
CREATE TABLE public.review_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correct_answers INTEGER NOT NULL,
  score_percent INTEGER NOT NULL,
  next_review_at_computed TIMESTAMP WITH TIME ZONE NOT NULL,
  review_note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de planos diários (daily_plans)
CREATE TABLE public.daily_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date_iso DATE NOT NULL,
  topic_ids_selected UUID[] NOT NULL DEFAULT '{}',
  topic_ids_completed UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_iso)
);

-- Tabela de configurações do usuário (user_settings)
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  cards_per_day INTEGER NOT NULL DEFAULT 10,
  questions_per_topic INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para subjects
CREATE POLICY "Users can view their own subjects" ON public.subjects
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON public.subjects
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON public.subjects
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON public.subjects
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para topics
CREATE POLICY "Users can view their own topics" ON public.topics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topics" ON public.topics
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" ON public.topics
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" ON public.topics
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para review_logs
CREATE POLICY "Users can view their own review_logs" ON public.review_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review_logs" ON public.review_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review_logs" ON public.review_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review_logs" ON public.review_logs
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para daily_plans
CREATE POLICY "Users can view their own daily_plans" ON public.daily_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily_plans" ON public.daily_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily_plans" ON public.daily_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily_plans" ON public.daily_plans
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_plans_updated_at
  BEFORE UPDATE ON public.daily_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX idx_topics_user_id ON public.topics(user_id);
CREATE INDEX idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX idx_review_logs_user_id ON public.review_logs(user_id);
CREATE INDEX idx_review_logs_topic_id ON public.review_logs(topic_id);
CREATE INDEX idx_daily_plans_user_id ON public.daily_plans(user_id);
CREATE INDEX idx_daily_plans_date ON public.daily_plans(date_iso);