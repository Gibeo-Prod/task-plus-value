
-- Vamos verificar a definição da tabela projects para entender as categorias válidas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'category';

-- Vamos também verificar se existe um enum ou constraint específico
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%category%' OR t.typname LIKE '%project%';

-- Verificar constraints check na tabela projects
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.projects'::regclass 
AND contype = 'c';
