
-- Vamos verificar quais valores são aceitos para a coluna category na tabela projects
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'projects'
  AND con.contype = 'c'
  AND con.conname = 'projects_category_check';
