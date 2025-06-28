
import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Grip } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProjectStatuses } from '@/hooks/useProjectStatuses'
import { ProjectStatus } from '@/types/projects'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectStatusManagerProps {
  onClose: () => void
}

const PRESET_COLORS = [
  '#a1a1aa', '#3b82f6', '#8b5cf6', '#22c55e', 
  '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'
]

export function ProjectStatusManager({ onClose }: ProjectStatusManagerProps) {
  const { statuses, addStatus, updateStatus, deleteStatus, reorderStatuses } = useProjectStatuses()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingColor, setEditingColor] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3b82f6')

  const handleEdit = (status: ProjectStatus) => {
    setEditingId(status.id)
    setEditingName(status.name)
    setEditingColor(status.color)
  }

  const handleSave = async (id: string) => {
    try {
      await updateStatus(id, { name: editingName, color: editingColor })
      setEditingId(null)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingName('')
    setEditingColor('')
  }

  const handleCreate = async () => {
    if (!newName.trim()) return

    try {
      await addStatus(newName, newColor)
      setIsCreating(false)
      setNewName('')
      setNewColor('#3b82f6')
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleDelete = async (id: string) => {
    await deleteStatus(id)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(statuses)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update sort_order for all items
    const reorderedStatuses = items.map((item, index) => ({
      ...item,
      sort_order: index
    }))

    reorderStatuses(reorderedStatuses)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gerenciar Status dos Projetos</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="statuses">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {statuses.map((status, index) => (
                  <Draggable key={status.id} draggableId={status.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 bg-muted/30 rounded-lg border ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps}>
                            <Grip className="h-4 w-4 text-muted-foreground cursor-grab" />
                          </div>

                          {editingId === status.id ? (
                            <>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex gap-1">
                                  {PRESET_COLORS.map(color => (
                                    <button
                                      key={color}
                                      className={`w-6 h-6 rounded-full border-2 ${
                                        editingColor === color ? 'border-foreground' : 'border-transparent'
                                      }`}
                                      style={{ backgroundColor: color }}
                                      onClick={() => setEditingColor(color)}
                                    />
                                  ))}
                                </div>
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave(status.id)
                                    if (e.key === 'Escape') handleCancel()
                                  }}
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" onClick={() => handleSave(status.id)}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-1">
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: status.color }}
                                />
                                <span className="font-medium">{status.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Ordem: {status.sort_order}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleEdit(status)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Status</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o status "{status.name}"? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(status.id)}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Separator />

        {isCreating ? (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
            <div className="flex gap-1">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newColor === color ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewColor(color)}
                />
              ))}
            </div>
            <Input
              placeholder="Nome do novo status"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewName('')
                }
              }}
            />
            <Button size="sm" onClick={handleCreate}>
              <Save className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsCreating(false)
                setNewName('')
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setIsCreating(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Status
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
