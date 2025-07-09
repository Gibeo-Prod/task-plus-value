
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, List, Settings, Plus } from 'lucide-react'
import { useChecklistTemplates, ChecklistTemplateItem } from '@/hooks/useChecklistTemplates'

interface ChecklistTemplateManagerProps {
  onClose?: () => void
}

export function ChecklistTemplateManager({ onClose }: ChecklistTemplateManagerProps) {
  const { templates, loading, fetchTemplateItems, getDefaultTemplate } = useChecklistTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const defaultTemplate = getDefaultTemplate()
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id)
      }
    }
  }, [templates])

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateItems(selectedTemplate)
    }
  }, [selectedTemplate])

  const loadTemplateItems = async (templateId: string) => {
    setLoadingItems(true)
    try {
      const items = await fetchTemplateItems(templateId)
      setTemplateItems(items)
    } catch (error) {
      console.error('Error loading template items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const groupedItems = templateItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistTemplateItem[]>)

  const categoryColors = {
    'ESTRUTURA': 'bg-blue-100 text-blue-800',
    'PROJETO': 'bg-green-100 text-green-800',
    'ACABAMENTOS': 'bg-orange-100 text-orange-800',
    'REVISÃO': 'bg-purple-100 text-purple-800',
    'PRODUÇÃO': 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Checklist</h2>
          <p className="text-muted-foreground">
            Gerencie os templates padrão para seus projetos
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Templates Disponíveis</h3>
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  {template.is_default && (
                    <Badge variant="secondary">Padrão</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Items */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Itens do Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingItems ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            className={categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}
                          >
                            {category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {items.length} {items.length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        <div className="space-y-2 pl-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{item.title}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total de itens: {templateItems.length}</span>
                        <span>Categorias: {Object.keys(groupedItems).length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um Template</h3>
                <p className="text-muted-foreground">
                  Escolha um template à esquerda para visualizar seus itens
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
