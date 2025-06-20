
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProjectInviteData {
  id: string
  project: {
    name: string
    description: string
    value: number
    status: string
    priority: string
    start_date: string
    due_date: string
  }
  client: {
    name: string
    company: string
  }
  recipient_name: string
  contact_type: string
  expires_at: string
  used_at: string | null
}

const ProjectInvite = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [invite, setInvite] = useState<ProjectInviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError("Token de convite inválido")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('project_invites')
          .select(`
            id,
            recipient_name,
            contact_type,
            expires_at,
            used_at,
            project:projects(name, description, value, status, priority, start_date, due_date),
            client:clients(name, company)
          `)
          .eq('token', token)
          .single()

        if (error) throw error

        // Check if invite exists
        if (!data) {
          setError("Convite não encontrado")
          setLoading(false)
          return
        }

        // Check if invite has expired
        const now = new Date()
        const expiresAt = new Date(data.expires_at)
        if (now > expiresAt) {
          setError("Este convite expirou")
          setLoading(false)
          return
        }

        setInvite(data as ProjectInviteData)
      } catch (err) {
        console.error('Error fetching invite:', err)
        setError("Erro ao carregar convite")
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  const markAsUsed = async () => {
    if (!invite) return

    try {
      const { error } = await supabase
        .from('project_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (error) throw error

      setInvite(prev => prev ? { ...prev, used_at: new Date().toISOString() } : null)
      
      toast({
        title: "Convite aceito!",
        description: "Você agora tem acesso ao projeto.",
      })
    } catch (err) {
      console.error('Error marking invite as used:', err)
      toast({
        title: "Erro",
        description: "Erro ao aceitar convite",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando convite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-red-600">Erro no Convite</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Ir para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invite) return null

  const isUsed = !!invite.used_at
  const statusIcon = isUsed ? <CheckCircle className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-blue-600" />
  const statusText = isUsed ? "Convite já aceito" : "Convite ativo"
  const statusColor = isUsed ? "text-green-600" : "text-blue-600"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {statusIcon}
              <span className={`font-medium ${statusColor}`}>{statusText}</span>
            </div>
            <CardTitle className="text-2xl">Convite para Projeto</CardTitle>
            <p className="text-muted-foreground">
              Olá {invite.recipient_name}! Você foi convidado(a) para acompanhar um projeto.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Project Info */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold text-lg mb-2">{invite.project.name}</h3>
              {invite.project.description && (
                <p className="text-muted-foreground mb-3">{invite.project.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Valor:</span>
                  <p>{formatCurrency(invite.project.value)}</p>
                </div>
                <div>
                  <span className="font-medium">Prioridade:</span>
                  <p className="capitalize">{invite.project.priority}</p>
                </div>
                <div>
                  <span className="font-medium">Início:</span>
                  <p>{formatDate(invite.project.start_date)}</p>
                </div>
                <div>
                  <span className="font-medium">Prazo:</span>
                  <p>{formatDate(invite.project.due_date)}</p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Cliente</h4>
              <p className="font-semibold">{invite.client.name}</p>
              {invite.client.company && (
                <p className="text-muted-foreground">{invite.client.company}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!isUsed && (
                <Button onClick={markAsUsed} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar Convite
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/5519996645698?text=Olá! Recebi o convite para o projeto "${invite.project.name}" e gostaria de conversar sobre ele.`
                  window.open(whatsappUrl, '_blank')
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar sobre o Projeto
              </Button>
            </div>

            {/* Invite Info */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Convite válido até: {formatDate(invite.expires_at)}</p>
              <p>Tipo de contato: {invite.contact_type === 'client' ? 'Cliente' : 'Pessoa de contato'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectInvite
