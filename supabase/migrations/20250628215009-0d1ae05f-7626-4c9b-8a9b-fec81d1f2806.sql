
-- Criar tabela para status de projetos personalizados
CREATE TABLE public.project_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#a1a1aa',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Habilitar RLS na tabela project_statuses
ALTER TABLE public.project_statuses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_statuses
CREATE POLICY "Users can view their own project statuses" 
  ON public.project_statuses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project statuses" 
  ON public.project_statuses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project statuses" 
  ON public.project_statuses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project statuses" 
  ON public.project_statuses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_project_statuses_updated_at
  BEFORE UPDATE ON public.project_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar status padrão para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_project_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.project_statuses (user_id, name, color, sort_order)
  VALUES
    (NEW.id, 'Planejamento', '#a1a1aa', 0),
    (NEW.id, 'Em Andamento', '#3b82f6', 1),
    (NEW.id, 'Em Revisão', '#8b5cf6', 2),
    (NEW.id, 'Concluído', '#22c55e', 3),
    (NEW.id, 'Pausado', '#f59e0b', 4),
    (NEW.id, 'Cancelado', '#ef4444', 5);
  RETURN NEW;
END;
$$;

-- Trigger para criar status padrão para novos usuários
CREATE TRIGGER on_auth_user_created_project_statuses
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_project_statuses();

-- Função para popular status para usuários existentes
CREATE OR REPLACE FUNCTION public.seed_existing_users_project_statuses()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    statuses_exist BOOLEAN;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Verificar se status já existem para este usuário
        SELECT EXISTS (SELECT 1 FROM public.project_statuses WHERE user_id = user_record.id) INTO statuses_exist;

        -- Se não existir, inserir status padrão
        IF NOT statuses_exist THEN
          INSERT INTO public.project_statuses (user_id, name, color, sort_order)
          VALUES
            (user_record.id, 'Planejamento', '#a1a1aa', 0),
            (user_record.id, 'Em Andamento', '#3b82f6', 1),
            (user_record.id, 'Em Revisão', '#8b5cf6', 2),
            (user_record.id, 'Concluído', '#22c55e', 3),
            (user_record.id, 'Pausado', '#f59e0b', 4),
            (user_record.id, 'Cancelado', '#ef4444', 5);
        END IF;
    END LOOP;
    RETURN 'Status padrão criados para usuários existentes.';
END;
$$;

-- Executar a função para popular usuários existentes
SELECT public.seed_existing_users_project_statuses();
