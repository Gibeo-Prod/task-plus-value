
-- Criar tabela para categorias de tarefas
CREATE TABLE public.task_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para etiquetas/tags
CREATE TABLE public.task_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para associar tarefas com etiquetas (many-to-many)
CREATE TABLE public.task_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, tag_id)
);

-- Criar tabela para lembretes
CREATE TABLE public.task_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas às tarefas existentes para suportar novas funcionalidades
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_date TIMESTAMP WITH TIME ZONE;

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Users can view their own categories" 
  ON public.task_categories 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories" 
  ON public.task_categories 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" 
  ON public.task_categories 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" 
  ON public.task_categories 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para etiquetas
CREATE POLICY "Users can view their own tags" 
  ON public.task_tags 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tags" 
  ON public.task_tags 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tags" 
  ON public.task_tags 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tags" 
  ON public.task_tags 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para associações de etiquetas
CREATE POLICY "Users can view their own tag assignments" 
  ON public.task_tag_assignments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own tag assignments" 
  ON public.task_tag_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own tag assignments" 
  ON public.task_tag_assignments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Políticas RLS para lembretes
CREATE POLICY "Users can view their own reminders" 
  ON public.task_reminders 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders" 
  ON public.task_reminders 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders" 
  ON public.task_reminders 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders" 
  ON public.task_reminders 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Criar trigger para atualizar updated_at nas categorias
CREATE TRIGGER update_task_categories_updated_at 
  BEFORE UPDATE ON public.task_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas categorias padrão (serão criadas para cada usuário quando necessário)
-- Isso será feito via código para garantir que seja por usuário
