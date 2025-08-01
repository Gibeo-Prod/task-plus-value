-- Corrigir projetos com status inválidos/antigos
-- Mapear status antigos para novos status válidos
UPDATE projects 
SET status = 'Concluído'
WHERE status IN ('completed', 'Concluído') 
  AND user_id = '4e6a9cb2-4d41-448f-8723-f8cbea9465e4'
  AND status != 'Concluído';

UPDATE projects 
SET status = 'Em Andamento'
WHERE status = 'in_progress' 
  AND user_id = '4e6a9cb2-4d41-448f-8723-f8cbea9465e4';

UPDATE projects 
SET status = 'Em Revisão'
WHERE status IN ('in_review', 'Em Revisão') 
  AND user_id = '4e6a9cb2-4d41-448f-8723-f8cbea9465e4'
  AND status != 'Em Revisão';

-- Adicionar status 'Concluído' que está sendo usado mas não existe
INSERT INTO project_statuses (user_id, name, color, sort_order)
VALUES ('4e6a9cb2-4d41-448f-8723-f8cbea9465e4', 'Concluído', '#22c55e', 9)
ON CONFLICT DO NOTHING;

-- Adicionar status 'Em Revisão' se não existir
INSERT INTO project_statuses (user_id, name, color, sort_order)
VALUES ('4e6a9cb2-4d41-448f-8723-f8cbea9465e4', 'Em Revisão', '#8b5cf6', 10)
ON CONFLICT DO NOTHING;

-- Remover status duplicado 'Em produção' (manter apenas 'Em Produção')
DELETE FROM project_statuses 
WHERE user_id = '4e6a9cb2-4d41-448f-8723-f8cbea9465e4' 
  AND name = 'Em produção' 
  AND sort_order = 8;