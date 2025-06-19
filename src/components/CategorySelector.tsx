
import { useState } from "react"
import { Plus, Folder, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskCategory } from "@/types/tasks"

interface CategorySelectorProps {
  categories: TaskCategory[]
  selectedCategory?: string
  onSelectCategory: (categoryId: string | undefined) => void
  onAddCategory: (name: string, color: string, icon: string) => void
}

const categoryColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
]

const categoryIcons = [
  "folder", "briefcase", "home", "heart", 
  "star", "bookmark", "tag", "target"
]

export function CategorySelector({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onAddCategory 
}: CategorySelectorProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState(categoryColors[0])
  const [newCategoryIcon, setNewCategoryIcon] = useState(categoryIcons[0])

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor, newCategoryIcon)
      setNewCategoryName("")
      setIsAddingCategory(false)
    }
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedCategory || "none"} onValueChange={(value) => onSelectCategory(value === "none" ? undefined : value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar categoria">
            {selectedCategoryData && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedCategoryData.color }}
                />
                <Folder className="w-4 h-4" />
                <span>{selectedCategoryData.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span>Sem categoria</span>
            </div>
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <Folder className="w-4 h-4" />
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Nova Categoria</h4>
            
            <Input
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1"
              >
                Criar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCategory(false)
                  setNewCategoryName("")
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
