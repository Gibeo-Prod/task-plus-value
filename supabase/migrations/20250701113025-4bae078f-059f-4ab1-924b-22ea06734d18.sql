
-- Remover a constraint que está causando o erro de categoria
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- Verificar se existem outras constraints relacionadas à categoria
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.projects'::regclass 
AND contype = 'c' 
AND pg_get_constraintdef(oid) ILIKE '%category%';
