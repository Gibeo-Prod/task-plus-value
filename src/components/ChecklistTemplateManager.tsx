
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, List, Settings, Plus, Pencil, Trash2, Save, X, Star, Crown, Tags } from 'lucide-react'
import { useChecklistTemplates, ChecklistTemplateItem } from '@/hooks/useChecklistTemplates'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ChecklistTemplateManagerProps {
  onClose?: () => void
}

interface EditingItem {
  id: string
  title: string
  description?: string
  category: string
}

export function ChecklistTemplateManager({ onClose }: ChecklistTemplateManagerProps) {
  const { isAdmin } = useAuth()
  const { 
    templates, 
    loading, 
    fetchTemplateItems, 
    createNewTemplate,
    updateTemplate, 
    updateTemplateItem,
    addTemplateItem,
    deleteTemplateItem,
    setDefaultTemplate,
    deleteTemplate,
    getDefaultTemplate 
  } = useChecklistTemplates()
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{ id: string; name: string; description?: string } | null>(null)
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', description: '', category: 'ESTRUTURA' })
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', is_default: false })

  const [categories, setCategories] = useState(['ESTRUTURA', 'PROJETO', 'ACABAMENTOS', 'REVISÃO', 'PRODUÇÃO'])
  const [showEditCategoriesDialog, setShowEditCategoriesDialog] = useState(false)
  const [editingCategories, setEditingCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')

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
      toast.error('Erro ao carregar itens do template')
    } finally {
      setLoadingItems(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return

    try {
      await updateTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        description: editingTemplate.description
      })
      setEditingTemplate(null)
      toast.success('Template atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Erro ao atualizar template')
    }
  }

  const handleSaveItem = async () => {
    if (!editingItem) return

    try {
      await updateTemplateItem(editingItem.id, {
        title: editingItem.title,
        description: editingItem.description,
        category: editingItem.category
      })
      setEditingItem(null)
      if (selectedTemplate) {
        await loadTemplateItems(selectedTemplate)
      }
      toast.success('Item atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Erro ao atualizar item')
    }
  }

  const handleAddItem = async () => {
    if (!selectedTemplate || !newItem.title.trim()) return

    try {
      await addTemplateItem(selectedTemplate, {
        title: newItem.title,
        description: newItem.description,
        category: newItem.category
      })
      setNewItem({ title: '', description: '', category: 'ESTRUTURA' })
      setShowAddItemDialog(false)
      await loadTemplateItems(selectedTemplate)
      toast.success('Item adicionado com sucesso!')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Erro ao adicionar item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      await deleteTemplateItem(itemId)
      if (selectedTemplate) {
        await loadTemplateItems(selectedTemplate)
      }
      toast.success('Item excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Erro ao excluir item')
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) return

    try {
      await createNewTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        is_default: newTemplate.is_default
      })
      setNewTemplate({ name: '', description: '', is_default: false })
      setShowCreateTemplateDialog(false)
      toast.success('Template criado com sucesso!')
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Erro ao criar template')
    }
  }

  const handleSetDefault = async (templateId: string) => {
    if (!isAdmin) return

    try {
      await setDefaultTemplate(templateId)
      toast.success('Template padrão definido!')
    } catch (error) {
      console.error('Error setting default template:', error)
      toast.error('Erro ao definir template padrão')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template? Todos os itens serão perdidos.')) return

    try {
      await deleteTemplate(templateId)
      setSelectedTemplate(null)
      toast.success('Template excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Erro ao excluir template')
    }
  }

  const handleEditCategories = () => {
    setEditingCategories([...categories])
    setShowEditCategoriesDialog(true)
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !editingCategories.includes(newCategory.trim().toUpperCase())) {
      setEditingCategories([...editingCategories, newCategory.trim().toUpperCase()])
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setEditingCategories(editingCategories.filter(cat => cat !== categoryToRemove))
  }

  const handleSaveCategories = () => {
    setCategories(editingCategories)
    setShowEditCategoriesDialog(false)
    toast.success('Categorias atualizadas com sucesso!')
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

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

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
            {isAdmin ? 'Gerencie todos os templates do sistema' : 'Gerencie os templates padrão para seus projetos'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Dialog open={showEditCategoriesDialog} onOpenChange={setShowEditCategoriesDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tags className="w-4 h-4 mr-2" />
                    Editar Categorias
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Categorias</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categorias Existentes</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {editingCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{category}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleRemoveCategory(category)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adicionar Nova Categoria</label>
                      <div className="flex gap-2">
                        <Input 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Nome da categoria"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowEditCategoriesDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveCategories}>
                        Salvar Categorias
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input 
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Nome do template"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea 
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Descrição do template"
                      rows={3}
                    />
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="isDefault"
                        checked={newTemplate.is_default}
                        onChange={(e) => setNewTemplate({ ...newTemplate, is_default: e.target.checked })}
                      />
                      <label htmlFor="isDefault" className="text-sm font-medium">
                        Marcar como template padrão
                      </label>
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Criar Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
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
                  <div className="flex-1">
                    {editingTemplate?.id === template.id ? (
                      <div className="space-y-2">
                        <Input 
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            name: e.target.value
                          })}
                          className="text-sm"
                        />
                        <Textarea 
                          value={editingTemplate.description || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            description: e.target.value
                          })}
                          placeholder="Descrição do template"
                          className="text-xs"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={handleSaveTemplate}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingTemplate(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {template.is_default && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Padrão
                      </Badge>
                    )}
                    {!editingTemplate && (
                      <div className="flex gap-1">
                        {isAdmin && !template.is_default && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetDefault(template.id)
                            }}
                            title="Definir como padrão"
                          >
                            <Crown className="w-3 h-3" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTemplate({
                              id: template.id,
                              name: template.name,
                              description: template.description
                            })
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTemplate(template.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Itens do Template
                  </CardTitle>
                  <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Item ao Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Título</label>
                          <Input 
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            placeholder="Título do item"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Categoria</label>
                          <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descrição (opcional)</label>
                          <Textarea 
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Descrição do item"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddItem}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                              {editingItem?.id === item.id ? (
                                <div className="flex-1 space-y-2">
                                  <Input 
                                    value={editingItem.title}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    className="text-sm"
                                  />
                                  <Select value={editingItem.category} onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}>
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={handleSaveItem}>
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm flex-1">{item.title}</span>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => setEditingItem({
                                        id: item.id,
                                        title: item.title,
                                        description: item.description,
                                        category: item.category
                                      })}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </>
                              )}
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
