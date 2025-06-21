
interface InviteDetailsProps {
  expiresAt: string
  contactType: string
}

export function InviteDetails({ expiresAt, contactType }: InviteDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="text-center text-xs sm:text-sm text-muted-foreground border-t pt-3 sm:pt-4 space-y-1">
      <p>Convite válido até: <span className="font-medium">{formatDate(expiresAt)}</span></p>
      <p>Tipo: <span className="font-medium">{contactType === 'client' ? 'Cliente' : 'Pessoa de contato'}</span></p>
    </div>
  )
}
