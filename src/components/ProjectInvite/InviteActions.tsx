
import { Button } from "@/components/ui/button"
import { CheckCircle, MessageCircle } from "lucide-react"

interface InviteActionsProps {
  isUsed: boolean
  projectName: string
  onAcceptInvite: () => void
}

export function InviteActions({ isUsed, projectName, onAcceptInvite }: InviteActionsProps) {
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/5519996645698?text=Olá! Recebi o convite para o projeto "${projectName}" e gostaria de conversar sobre ele.`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="flex flex-col gap-3">
      {!isUsed && (
        <Button onClick={onAcceptInvite} className="w-full h-11 sm:h-10 text-base sm:text-sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          Aceitar Convite
        </Button>
      )}
      
      <Button 
        variant="outline" 
        className="w-full h-11 sm:h-10 text-base sm:text-sm"
        onClick={handleWhatsAppClick}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Conversar sobre o Projeto
      </Button>
    </div>
  )
}
