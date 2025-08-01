-- Fix all remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_checklist_templates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_project_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.project_statuses (user_id, name, color, sort_order)
  VALUES
    (NEW.id, 'Planejamento', '#a1a1aa', 0),
    (NEW.id, 'Em Andamento', '#3b82f6', 1),
    (NEW.id, 'Em Revisão', '#8b5cf6', 2),
    (NEW.id, 'Em produção', '#10b981', 3),
    (NEW.id, 'Concluído', '#22c55e', 4),
    (NEW.id, 'Pausado', '#f59e0b', 5),
    (NEW.id, 'Cancelado', '#ef4444', 6);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_statuses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.task_statuses (user_id, name, color, sort_order)
  VALUES
    (NEW.id, 'Pendente', '#a1a1aa', 0),
    (NEW.id, 'Em Andamento', '#3b82f6', 1),
    (NEW.id, 'Concluído', '#22c55e', 2),
    (NEW.id, 'Atrasado', '#ef4444', 3);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_existing_users_project_statuses()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    user_record RECORD;
    statuses_exist BOOLEAN;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        SELECT EXISTS (SELECT 1 FROM public.project_statuses WHERE user_id = user_record.id) INTO statuses_exist;
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

CREATE OR REPLACE FUNCTION public.update_task_reminders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_existing_users_statuses()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    user_record RECORD;
    statuses_exist BOOLEAN;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        SELECT EXISTS (SELECT 1 FROM public.task_statuses WHERE user_id = user_record.id) INTO statuses_exist;
        IF NOT statuses_exist THEN
          INSERT INTO public.task_statuses (user_id, name, color, sort_order)
          VALUES
            (user_record.id, 'Pendente', '#a1a1aa', 0),
            (user_record.id, 'Em Andamento', '#3b82f6', 1),
            (user_record.id, 'Concluído', '#22c55e', 2),
            (user_record.id, 'Atrasado', '#ef4444', 3);
        END IF;
    END LOOP;
    RETURN 'Seeding completed for existing users.';
END;
$$;