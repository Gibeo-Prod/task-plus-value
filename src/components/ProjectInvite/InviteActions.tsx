
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckCircle, MessageCircle, Eye } from "lucide-react"

interface InviteActionsProps {
  isUsed: boolean
  projectName: string
  onAcceptInvite: () => void
  token?: string
}

export function InviteActions({ isUsed, projectName, onAcceptInvite, token }: InviteActionsProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const navigate = useNavigate()

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/5519996645698?text=Olá! Recebi o convite para o projeto "${projectName}" e gostaria de conversar sobre ele.`
    window.open(whatsappUrl, '_blank')
  }

  const handleAcceptInvite = async () => {
    if (!token) return
    
    setIsAccepting(true)
    try {
      await onAcceptInvite()
      // Redirecionar para a página de visualização do projeto após aceitar
      setTimeout(() => {
        navigate(`/projeto-visualizar/${token}`)
      }, 1500)
    } catch (error) {
      console.error('Error accepting invite:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleViewProject = () => {
    if (token) {
      navigate(`/projeto-visualizar/${token}`)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {!isUsed ? (
        <Button 
          onClick={handleAcceptInvite} 
          disabled={isAccepting}
          className="w-full h-11 sm:h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isAccepting ? "Aceitando..." : "Aceitar Convite"}
        </Button>
      ) : (
        <Button 
          onClick={handleViewProject}
          className="w-full h-11 sm:h-10 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Projeto
        </Button>
      )}
      
      <Button 
        variant="outline" 
        className="w-full h-11 sm:h-10 text-sm font-semibold border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
        onClick={handleWhatsAppClick}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Conversar sobre o Projeto
      </Button>
    </div>
  )
}
