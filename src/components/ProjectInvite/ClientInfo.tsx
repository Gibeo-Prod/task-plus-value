
interface ClientData {
  name: string
  company: string
}

interface ClientInfoProps {
  client: ClientData
}

export function ClientInfo({ client }: ClientInfoProps) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white space-y-2">
      <h4 className="font-medium text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
        Informações do Cliente
      </h4>
      <div className="space-y-1">
        <p className="font-semibold text-base sm:text-lg break-words leading-tight">
          {client.name}
        </p>
        {client.company && (
          <p className="text-muted-foreground text-sm sm:text-base break-words">
            {client.company}
          </p>
        )}
      </div>
    </div>
  )
}
