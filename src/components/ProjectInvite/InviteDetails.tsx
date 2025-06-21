
interface InviteDetailsProps {
  expiresAt: string
  contactType: string
}

export function InviteDetails({ expiresAt, contactType }: InviteDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="text-center text-xs sm:text-sm text-muted-foreground border-t pt-3 sm:pt-4 space-y-2">
      <div className="flex flex-col gap-2 sm:gap-1">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          <span>Válido até:</span> 
          <span className="font-semibold text-foreground">{formatDate(expiresAt)}</span>
        </p>
        <p className="flex items-center justify-center gap-1 flex-wrap">
          <span>Tipo:</span> 
          <span className="font-semibold text-foreground">
            {contactType === 'client' ? 'Cliente' : 'Pessoa de contato'}
          </span>
        </p>
      </div>
    </div>
  )
}
