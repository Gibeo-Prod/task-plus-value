
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjectInvite } from "@/hooks/useProjectInvite"
import { ProjectInfo } from "@/components/ProjectInvite/ProjectInfo"
import { ClientInfo } from "@/components/ProjectInvite/ClientInfo"
import { InviteError } from "@/components/ProjectInvite/InviteError"
import { InviteLoading } from "@/components/ProjectInvite/InviteLoading"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MessageCircle, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

const ProjectView = () => {
  const { token } = useParams<{ token: string }>()
  const { invite, loading, error } = useProjectInvite(token)

  if (loading) {
    return <InviteLoading />
  }

  if (error) {
    return <InviteError error={error} />
  }

  if (!invite) return null

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/5519996645698?text=Olá! Estou acessando o projeto "${invite.project.name}" e gostaria de conversar sobre ele.`
    window.open(whatsappUrl, '_blank')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-2 sm:py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Acesso Autorizado
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Visualização do Projeto
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), <span className="font-semibold">{invite.recipient_name}</span>!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informações do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectInfo project={invite.project} />
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status e Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="font-semibold capitalize">{invite.project.status}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Valor</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(invite.project.value)}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Prazo</div>
                    <div className="font-semibold text-orange-600">
                      {formatDate(invite.project.due_date)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientInfo client={invite.client} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comunicação</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar no WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectView
