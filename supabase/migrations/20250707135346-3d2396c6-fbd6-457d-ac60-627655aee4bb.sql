
-- Remover a constraint antiga que está limitando os valores de status
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Verificar se existe alguma outra constraint relacionada a status e removê-la
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS valid_status;

-- Como agora os usuários podem criar status personalizados através da tabela project_statuses,
-- não precisamos mais de uma constraint rígida de valores específicos na tabela projects.
-- O controle de status válidos será feito pela aplicação através da tabela project_statuses.
