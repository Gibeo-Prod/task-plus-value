
-- Atualizar projetos existentes para usar nomes de status em vez de códigos
-- Isso garantirá que todos os projetos usem os nomes exatos dos status

UPDATE projects 
SET status = 'Planejamento' 
WHERE status = 'new';

UPDATE projects 
SET status = 'Em Andamento' 
WHERE status = 'in_progress';

UPDATE projects 
SET status = 'Em Revisão' 
WHERE status = 'in_review';

UPDATE projects 
SET status = 'Concluído' 
WHERE status = 'completed';

UPDATE projects 
SET status = 'Pausado' 
WHERE status = 'on_hold';

UPDATE projects 
SET status = 'Cancelado' 
WHERE status = 'cancelled';

-- Verificar se existem outros códigos de status que precisam ser mapeados
-- (esta query é apenas para verificação, não executa alterações)
SELECT DISTINCT status, COUNT(*) as count 
FROM projects 
GROUP BY status 
ORDER BY status;
