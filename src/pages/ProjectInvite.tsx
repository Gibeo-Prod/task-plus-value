
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjectInvite } from "@/hooks/useProjectInvite"
import { InviteStatus } from "@/components/ProjectInvite/InviteStatus"
import { ProjectInfo } from "@/components/ProjectInvite/ProjectInfo"
import { ClientInfo } from "@/components/ProjectInvite/ClientInfo"
import { InviteActions } from "@/components/ProjectInvite/InviteActions"
import { InviteDetails } from "@/components/ProjectInvite/InviteDetails"
import { InviteError } from "@/components/ProjectInvite/InviteError"
import { InviteLoading } from "@/components/ProjectInvite/InviteLoading"

const ProjectInvite = () => {
  const { token } = useParams<{ token: string }>()
  const { invite, loading, error, markAsUsed } = useProjectInvite(token)

  if (loading) {
    return <InviteLoading />
  }

  if (error) {
    return <InviteError error={error} />
  }

  if (!invite) return null

  const isUsed = !!invite.used_at

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-2 sm:py-4 md:py-8 px-2 sm:px-4">
      <div className="max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        <Card className="shadow-lg border-0 sm:border overflow-hidden">
          <CardHeader className="text-center p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3">
            <InviteStatus isUsed={isUsed} />
            <CardTitle className="text-base sm:text-lg lg:text-xl font-bold leading-tight px-2">
              Convite para Projeto
            </CardTitle>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed px-2">
              Olá <span className="font-semibold text-foreground">{invite.recipient_name}</span>! 
              <br />
              Você foi convidado(a) para acompanhar um projeto.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-3 sm:space-y-4 lg:space-y-5 p-3 sm:p-4 lg:p-6 pt-0">
            <ProjectInfo project={invite.project} />
            <ClientInfo client={invite.client} />
            <InviteActions 
              isUsed={isUsed} 
              projectName={invite.project.name}
              onAcceptInvite={markAsUsed}
              token={token}
            />
            <InviteDetails 
              expiresAt={invite.expires_at}
              contactType={invite.contact_type}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectInvite
