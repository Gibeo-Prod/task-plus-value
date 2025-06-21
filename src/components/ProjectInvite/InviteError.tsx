
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface InviteErrorProps {
  error: string
}

export function InviteError({ error }: InviteErrorProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-4 sm:p-6">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-red-500" />
          <CardTitle className="text-red-600 text-lg sm:text-xl">Erro no Convite</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4 sm:p-6 pt-0">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full">
            Ir para Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
