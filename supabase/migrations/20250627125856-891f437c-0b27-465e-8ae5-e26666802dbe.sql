
-- Create table for checklist templates
CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for checklist template items
CREATE TABLE public.checklist_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for checklist_templates
CREATE POLICY "Users can view their own checklist templates"
  ON public.checklist_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklist templates"
  ON public.checklist_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist templates"
  ON public.checklist_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist templates"
  ON public.checklist_templates FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for checklist_template_items
CREATE POLICY "Users can view template items from their templates"
  ON public.checklist_template_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.checklist_templates 
    WHERE id = template_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create template items for their templates"
  ON public.checklist_template_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.checklist_templates 
    WHERE id = template_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update template items from their templates"
  ON public.checklist_template_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.checklist_templates 
    WHERE id = template_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete template items from their templates"
  ON public.checklist_template_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.checklist_templates 
    WHERE id = template_id AND user_id = auth.uid()
  ));

-- Create default checklist template with your items
INSERT INTO public.checklist_templates (user_id, name, description, is_default)
SELECT 
  id,
  'Template Padrão de Projeto',
  'Checklist padrão para desenvolvimento de projetos de interiores',
  true
FROM auth.users
WHERE EXISTS (SELECT 1 FROM auth.users);

-- Insert the checklist items based on your handwritten list
INSERT INTO public.checklist_template_items (template_id, title, category, sort_order)
SELECT 
  t.id,
  item.title,
  item.category,
  item.sort_order
FROM public.checklist_templates t
CROSS JOIN (
  VALUES 
    ('Medição do ambiente', 'Ambiente', 1),
    ('Levantamento fotográfico', 'Ambiente', 2),
    ('Briefing com cliente', 'Ambiente', 3),
    ('Análise do espaço existente', 'Ambiente', 4),
    ('Definição de estilo', 'Ambiente', 5),
    ('Levantamento de móveis existentes', 'Móveis', 6),
    ('Definição de móveis novos', 'Móveis', 7),
    ('Especificação de materiais', 'Móveis', 8),
    ('Orçamento de móveis', 'Móveis', 9),
    ('Levantamento elétrico existente', 'Elétrica', 10),
    ('Projeto de iluminação', 'Elétrica', 11),
    ('Especificação de luminárias', 'Elétrica', 12),
    ('Projeto elétrico complementar', 'Elétrica', 13),
    ('Layout inicial', 'Plantas', 14),
    ('Planta baixa humanizada', 'Plantas', 15),
    ('Cortes e elevações', 'Plantas', 16),
    ('Detalhamentos', 'Plantas', 17),
    ('Renderização 3D', 'Plantas', 18)
) AS item(title, category, sort_order)
WHERE t.is_default = true;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_checklist_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_checklist_templates_updated_at();
