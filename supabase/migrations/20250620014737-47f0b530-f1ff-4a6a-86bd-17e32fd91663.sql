
-- Criar tabela para armazenar lembretes das tarefas
CREATE TABLE public.task_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios lembretes
CREATE POLICY "Users can view their own reminders"
  ON public.task_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários criarem lembretes
CREATE POLICY "Users can create reminders"
  ON public.task_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus lembretes
CREATE POLICY "Users can update their own reminders"
  ON public.task_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para usuários excluírem seus lembretes
CREATE POLICY "Users can delete their own reminders"
  ON public.task_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_task_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_reminders_updated_at
    BEFORE UPDATE ON public.task_reminders
    FOR EACH ROW
    EXECUTE PROCEDURE update_task_reminders_updated_at();
