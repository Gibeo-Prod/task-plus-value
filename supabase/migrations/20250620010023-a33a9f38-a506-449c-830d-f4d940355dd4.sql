
-- 1. Remover todas as políticas RLS existentes da tabela tasks para limpar duplicatas
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

-- 2. Adicionar valores padrão para campos obrigatórios
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE public.tasks ALTER COLUMN priority SET DEFAULT 'medium';

-- 3. Adicionar constraints para garantir valores válidos
ALTER TABLE public.tasks ADD CONSTRAINT valid_status 
CHECK (status IN ('new', 'in_progress', 'in_review', 'completed', 'on_hold', 'cancelled', 'overdue'));

ALTER TABLE public.tasks ADD CONSTRAINT valid_priority 
CHECK (priority IN ('low', 'medium', 'high'));

-- 4. Recriar políticas RLS limpas e funcionais
CREATE POLICY "enable_select_for_users_on_tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_users_on_tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_users_on_tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_users_on_tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Garantir que RLS está habilitado
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. Fazer o mesmo para task_categories (limpar duplicatas se existirem)
DROP POLICY IF EXISTS "Users can view their own categories" ON public.task_categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.task_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.task_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.task_categories;

CREATE POLICY "enable_select_for_users_on_categories" 
  ON public.task_categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_users_on_categories" 
  ON public.task_categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_users_on_categories" 
  ON public.task_categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_users_on_categories" 
  ON public.task_categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Fazer o mesmo para task_tags
DROP POLICY IF EXISTS "Users can view their own tags" ON public.task_tags;
DROP POLICY IF EXISTS "Users can create their own tags" ON public.task_tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON public.task_tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON public.task_tags;

CREATE POLICY "enable_select_for_users_on_tags" 
  ON public.task_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_insert_for_users_on_tags" 
  ON public.task_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enable_update_for_users_on_tags" 
  ON public.task_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "enable_delete_for_users_on_tags" 
  ON public.task_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 8. Limpar e recriar políticas para task_tag_assignments
DROP POLICY IF EXISTS "Users can view their own tag assignments" ON public.task_tag_assignments;
DROP POLICY IF EXISTS "Users can create their own tag assignments" ON public.task_tag_assignments;
DROP POLICY IF EXISTS "Users can delete their own tag assignments" ON public.task_tag_assignments;

CREATE POLICY "enable_select_for_users_on_tag_assignments" 
  ON public.task_tag_assignments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "enable_insert_for_users_on_tag_assignments" 
  ON public.task_tag_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "enable_delete_for_users_on_tag_assignments" 
  ON public.task_tag_assignments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_tag_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));
