
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
  const bgColor = isUsed ? "bg-green-50" : "bg-blue-50"

  return (
    <div className={`flex items-center justify-center gap-2 mb-2 p-2 sm:p-3 rounded-full ${bgColor} border border-current/20 mx-2`}>
      {statusIcon}
      <span className={`font-semibold text-xs sm:text-sm ${statusColor}`}>
        {statusText}
      </span>
    </div>
  )
}
