
import { useState } from "react"
import { Building2, Users, MoreVertical, Archive, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Client } from "@/types/tasks"

interface ClientItemProps {
  client: Client
  isSelected: boolean
  onClick: () => void
  onArchive: (clientId: string) => void
  onDelete: (clientId: string) => void
}

export function ClientItem({ client, isSelected, onClick, onArchive, onDelete }: ClientItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const handleArchive = () => {
    onArchive(client.id)
    setShowArchiveDialog(false)
  }

  const handleDelete = () => {
    onDelete(client.id)
    setShowDeleteDialog(false)
  }

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <>
      <div
        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-ms-blue text-white" : "hover:bg-muted"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isSelected ? "bg-white/20" : "bg-muted"
          }`}>
            <Building2 className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm truncate ${
              isSelected ? "text-white" : "text-foreground"
            }`}>
              {client.name}
            </div>
            <div className={`text-xs flex items-center gap-1 ${
              isSelected ? "text-white/70" : "text-muted-foreground"
            }`}>
              <Users className="w-3 h-3" />
              {client.projects} projeto{client.projects !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected ? "hover:bg-white/20" : "hover:bg-muted"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className={`h-4 w-4 ${isSelected ? "text-white" : ""}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleMenuAction(e, () => setShowArchiveDialog(true))}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, () => setShowDeleteDialog(true))}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar o cliente "{client.name}"? 
              O cliente será removido da lista principal mas poderá ser restaurado posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o cliente "{client.name}"? 
              Esta ação não pode ser desfeita e todos os projetos associados também serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
