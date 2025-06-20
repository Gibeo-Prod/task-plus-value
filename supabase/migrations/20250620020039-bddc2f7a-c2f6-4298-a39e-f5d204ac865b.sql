
-- Adicionar coluna archived na tabela clients
ALTER TABLE public.clients 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

-- Atualizar a função de trigger se necessário para incluir a nova coluna
-- (não é necessário criar novos triggers, apenas documentando a alteração)
