
import { CheckCircle, Clock } from "lucide-react"

interface InviteStatusProps {
  isUsed: boolean
}

export function InviteStatus({ isUsed }: InviteStatusProps) {
  const statusIcon = isUsed ? 
    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" /> : 
    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
  
  const statusText = isUsed ? "Convite já aceito" : "Convite ativo"
  const statusColor = isUsed ? "text-green-600" : "text-blue-600"
  const bgColor = isUsed ? "bg-green-50" : "bg-blue-50"

  return (
    <div className={`flex items-center justify-center gap-2 mb-2 p-2 sm:p-3 rounded-full ${bgColor} border border-current/20`}>
      {statusIcon}
      <span className={`font-semibold text-sm sm:text-base ${statusColor}`}>
        {statusText}
      </span>
    </div>
  )
}
