
-- Alterar a coluna project_id para aceitar valores NULL
ALTER TABLE public.tasks ALTER COLUMN project_id DROP NOT NULL;

-- Remover a constraint de foreign key existente
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;

-- Recriar a constraint de foreign key permitindo NULL
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
