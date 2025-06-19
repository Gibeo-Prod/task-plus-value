
import { useState } from "react"
import { X, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TaskTag } from "@/types/tasks"

interface TagSelectorProps {
  availableTags: TaskTag[]
  selectedTags: TaskTag[]
  onTagsChange: (tags: TaskTag[]) => void
  onAddTag: (name: string, color: string) => void
}

const tagColors = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
]

export function TagSelector({ 
  availableTags, 
  selectedTags, 
  onTagsChange, 
  onAddTag 
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(tagColors[0])

  const handleToggleTag = (tag: TaskTag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id)
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId))
  }

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), newTagColor)
      setNewTagName("")
      setIsAddingTag(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1"
            style={{ backgroundColor: tag.color + "20", color: tag.color }}
          >
            <Tag className="w-3 h-3" />
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" />
              <Tag className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Etiquetas</h4>
              
              {!isAddingTag ? (
                <>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.some(t => t.id === tag.id)
                      return (
                        <div
                          key={tag.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleToggleTag(tag)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          />
                          <Tag className="w-4 h-4" />
                          <span className="flex-1">{tag.name}</span>
                          {isSelected && <X className="w-4 h-4" />}
                        </div>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingTag(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Etiqueta
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da etiqueta"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor</label>
                    <div className="flex gap-2">
                      {tagColors.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newTagColor === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddTag}
                      disabled={!newTagName.trim()}
                      className="flex-1"
                    >
                      Criar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingTag(false)
                        setNewTagName("")
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
