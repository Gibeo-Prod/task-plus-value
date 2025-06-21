
import { CheckCircle, Clock } from "lucide-react"

interface InviteStatusProps {
  isUsed: boolean
}

export function InviteStatus({ isUsed }: InviteStatusProps) {
  const statusIcon = isUsed ? 
    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> : 
    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
  
  const statusText = isUsed ? "Convite já aceito" : "Convite ativo"
  const statusColor = isUsed ? "text-green-600" : "text-blue-600"

  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {statusIcon}
      <span className={`font-medium text-sm sm:text-base ${statusColor}`}>{statusText}</span>
    </div>
  )
}
