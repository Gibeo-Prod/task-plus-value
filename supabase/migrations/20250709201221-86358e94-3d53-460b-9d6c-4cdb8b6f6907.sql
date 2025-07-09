-- Limpar itens do template padrão existente
DELETE FROM public.checklist_template_items 
WHERE template_id IN (
  SELECT id FROM public.checklist_templates WHERE is_default = true
);

-- Atualizar descrição do template padrão
UPDATE public.checklist_templates 
SET name = 'Template Padrão de Marcenaria',
    description = 'Checklist completo para projetos de móveis planejados e marcenaria'
WHERE is_default = true;

-- Inserir os novos itens do template
INSERT INTO public.checklist_template_items (template_id, title, category, sort_order)
SELECT 
  t.id,
  item.title,
  item.category,
  item.sort_order
FROM public.checklist_templates t
CROSS JOIN (
  VALUES 
    -- ESTRUTURA (4 itens)
    ('PAREDES', 'ESTRUTURA', 1),
    ('ESQUADRIAS', 'ESTRUTURA', 2),
    ('HIDRAULICA', 'ESTRUTURA', 3),
    ('ELETRICA', 'ESTRUTURA', 4),
    
    -- PROJETO (8 itens)
    ('MODELO CORREDIÇAS', 'PROJETO', 5),
    ('MODELO DOBRADIÇAS', 'PROJETO', 6),
    ('COR INTERNA', 'PROJETO', 7),
    ('COR EXTERNA', 'PROJETO', 8),
    ('MODELO PUXADOR', 'PROJETO', 9),
    ('MEDIDAS DOS ARMARIOS', 'PROJETO', 10),
    ('ADICIONAR CAIXAS', 'PROJETO', 11),
    ('ADICIONAR PRATAELEIRAS', 'PROJETO', 12),
    
    -- ACABAMENTOS (3 itens)
    ('FITA TOPOS', 'ACABAMENTOS', 13),
    ('FITA PRATELEIRAS', 'ACABAMENTOS', 14),
    ('ADICIONAR PORTAS', 'ACABAMENTOS', 15),
    
    -- REVISÃO (3 itens)
    ('REVISAR CORES', 'REVISÃO', 16),
    ('REVISAR PUXADORES', 'REVISÃO', 17),
    ('REVISÃO DO PROJETO', 'REVISÃO', 18),
    
    -- PRODUÇÃO (6 itens)
    ('CRIAR PLANO DE CORTE', 'PRODUÇÃO', 19),
    ('CRIAR LOTE', 'PRODUÇÃO', 20),
    ('IMPRIMIR PLANO', 'PRODUÇÃO', 21),
    ('IMPRIMIR LISTA COMPRA', 'PRODUÇÃO', 22),
    ('GERAR GCODE', 'PRODUÇÃO', 23),
    ('PROJETO FINALIZADO', 'PRODUÇÃO', 24)
) AS item(title, category, sort_order)
WHERE t.is_default = true;