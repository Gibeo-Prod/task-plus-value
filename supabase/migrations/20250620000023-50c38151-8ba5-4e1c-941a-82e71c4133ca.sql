
-- Primeiro, vamos migrar os dados da tabela 'tasks' para 'project_tasks'
-- e depois renomear 'project_tasks' para 'tasks'

-- 1. Migrar dados existentes da tabela 'tasks' para 'project_tasks'
INSERT INTO public.project_tasks (
  id,
  user_id,
  project_id,
  title,
  description,
  status,
  priority,
  due_date,
  completed,
  assigned_to,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  CASE 
    WHEN project IS NOT NULL AND project != '' THEN 
      (SELECT id FROM projects WHERE name = tasks.project AND user_id = tasks.user_id LIMIT 1)
    ELSE NULL 
  END as project_id,
  activity as title,
  notes as description,
  status,
  COALESCE(priority, 'medium') as priority,
  CASE 
    WHEN date IS NOT NULL THEN date::date 
    ELSE NULL 
  END as due_date,
  CASE 
    WHEN status = 'Concluído' THEN true 
    ELSE false 
  END as completed,
  responsible as assigned_to,
  created_at,
  updated_at
FROM public.tasks
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_tasks pt WHERE pt.id = tasks.id
);

-- 2. Remover a tabela 'tasks' antiga
DROP TABLE IF EXISTS public.tasks CASCADE;

-- 3. Renomear 'project_tasks' para 'tasks' 
ALTER TABLE public.project_tasks RENAME TO tasks;

-- 4. Atualizar as políticas RLS para a nova tabela 'tasks'
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Recriar políticas RLS para a nova estrutura
CREATE POLICY "Users can view their own tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (user_id = auth.uid());

-- 5. Remover tabelas não utilizadas
DROP TABLE IF EXISTS public.subtasks CASCADE;
DROP TABLE IF EXISTS public.task_notes CASCADE;
DROP TABLE IF EXISTS public.task_reminders CASCADE;

-- 6. Atualizar referências nas políticas de task_tag_assignments
DROP POLICY IF EXISTS "Users can view their own tag assignments" ON public.task_tag_assignments;
DROP POLICY IF EXISTS "Users can create their own tag assignments" ON public.task_tag_assignments;
DROP POLICY IF EXISTS "Users can delete their own tag assignments" ON public.task_tag_assignments;

CREATE POLICY "Users can view their own tag assignments" 
  ON public.task_tag_assignments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own tag assignments" 
  ON public.task_tag_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own tag assignments" 
  ON public.task_tag_assignments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- 7. Adicionar constraint de foreign key para project_id
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 8. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
