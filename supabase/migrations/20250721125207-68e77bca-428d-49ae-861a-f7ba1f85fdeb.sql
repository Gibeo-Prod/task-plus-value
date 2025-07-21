-- Adicionar status "Em produção" para usuários existentes que não possuem
INSERT INTO public.project_statuses (user_id, name, color, sort_order)
SELECT DISTINCT ps.user_id, 'Em produção', '#10b981', 
  COALESCE((SELECT MAX(sort_order) + 1 FROM public.project_statuses ps2 WHERE ps2.user_id = ps.user_id), 6)
FROM public.project_statuses ps
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_statuses ps3 
  WHERE ps3.user_id = ps.user_id AND ps3.name = 'Em produção'
);