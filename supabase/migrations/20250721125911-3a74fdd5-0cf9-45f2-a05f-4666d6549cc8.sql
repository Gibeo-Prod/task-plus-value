-- Atualizar a função handle_new_user_project_statuses para incluir o status "Em produção"
CREATE OR REPLACE FUNCTION public.handle_new_user_project_statuses()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;