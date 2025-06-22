
import { useState } from "react"
import { MessageSquare, Phone, User, Mail, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Client, Project } from "@/types/tasks"
import { useProjectInvites } from "@/hooks/useProjectInvites"
import { generateShortToken } from "@/utils/tokenHandler"

interface WhatsAppInviteModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  client: Client
}

export function WhatsAppInviteModal({ isOpen, onClose, project, client }: WhatsAppInviteModalProps) {
  const [selectedContact, setSelectedContact] = useState<'client' | 'contact_person'>('client')
  const [isCreating, setIsCreating] = useState(false)
  const { createInvite, sendWhatsAppInvite } = useProjectInvites(project.id)

  const handleSendInvite = async () => {
    setIsCreating(true)
    
    try {
      const recipientData = selectedContact === 'client' 
        ? {
            name: client.name,
            phone: client.phone || '',
            email: client.email
          }
        : {
            name: client.contactPersonName || '',
            phone: client.contactPersonPhone || '',
            email: client.contactPersonEmail
          }

      if (!recipientData.phone) {
        throw new Error('Número de telefone não encontrado')
      }

      // Create invite in database with short token
      createInvite({
        projectId: project.id,
        clientId: client.id,
        contactType: selectedContact,
        recipientName: recipientData.name,
        recipientPhone: recipientData.phone,
        recipientEmail: recipientData.email
      })

      // Generate and send WhatsApp message with short token
      const shortToken = generateShortToken()
      const invite = {
        id: crypto.randomUUID(),
        projectId: project.id,
        clientId: client.id,
        invitedBy: '',
        token: shortToken,
        contactType: selectedContact,
        recipientName: recipientData.name,
        recipientPhone: recipientData.phone,
        recipientEmail: recipientData.email,
        expiresAt: '',
        createdAt: '',
        updatedAt: ''
      }

      sendWhatsAppInvite(invite, project, client)
      onClose()
    } catch (error) {
      console.error('Error sending invite:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const canSendToClient = client.phone
  const canSendToContact = client.contactPersonName && client.contactPersonPhone

  if (!canSendToClient && !canSendToContact) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Convite via WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Phone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum número de telefone encontrado para este cliente.
              Edite o cliente para adicionar informações de contato.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Enviar Convite via WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Projeto: {project.name}</h4>
              <p className="text-sm text-muted-foreground">
                Cliente: {client.name}
                {client.company && ` - ${client.company}`}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label className="text-base font-medium">Escolha o destinatário:</Label>
            
            <RadioGroup value={selectedContact} onValueChange={(value: any) => setSelectedContact(value)}>
              {canSendToClient && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {canSendToContact && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="contact_person" id="contact_person" />
                  <Label htmlFor="contact_person" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{client.contactPersonName}</div>
                        <div className="text-sm text-muted-foreground">Responsável da empresa</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.contactPersonPhone}
                        </div>
                        {client.contactPersonEmail && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.contactPersonEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendInvite}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {isCreating ? 'Enviando...' : 'Enviar WhatsApp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
