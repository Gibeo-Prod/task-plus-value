
interface ClientData {
  name: string
  company: string
}

interface ClientInfoProps {
  client: ClientData
}

export function ClientInfo({ client }: ClientInfoProps) {
  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-white">
      <h4 className="font-medium mb-2 text-sm sm:text-base">Cliente</h4>
      <p className="font-semibold text-sm sm:text-base break-words">{client.name}</p>
      {client.company && (
        <p className="text-muted-foreground text-sm break-words">{client.company}</p>
      )}
    </div>
  )
}
