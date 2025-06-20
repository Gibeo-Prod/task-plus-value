
-- Remover a constraint antiga que ainda está causando problemas
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS project_tasks_status_check;

-- Garantir que a constraint correta está em vigor
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.tasks ADD CONSTRAINT valid_status 
CHECK (status IN ('new', 'in_progress', 'in_review', 'completed', 'on_hold', 'cancelled', 'overdue'));

-- Verificar se existem outras constraints problemáticas e removê-las
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS project_tasks_priority_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS valid_priority;
ALTER TABLE public.tasks ADD CONSTRAINT valid_priority 
CHECK (priority IN ('low', 'medium', 'high'));
