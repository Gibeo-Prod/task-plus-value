
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Building, Mail, Phone } from "lucide-react"

interface ClientFormProps {
  onSubmit: (clientData: {
    name: string
    email: string
    phone?: string
    company?: string
    contactPersonName?: string
    contactPersonEmail?: string
    contactPersonPhone?: string
  }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ClientForm({ onSubmit, onCancel, isLoading = false }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      contactPersonName: formData.contactPersonName || undefined,
      contactPersonEmail: formData.contactPersonEmail || undefined,
      contactPersonPhone: formData.contactPersonPhone || undefined
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Novo Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Principais do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Informações do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cliente *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações da Pessoa de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Pessoa de Contato (Opcional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Caso haja uma pessoa específica para contato no projeto
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Nome da Pessoa de Contato</Label>
              <Input
                id="contactPersonName"
                type="text"
                value={formData.contactPersonName}
                onChange={(e) => handleChange("contactPersonName", e.target.value)}
                placeholder="Nome completo da pessoa de contato"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">Email da Pessoa de Contato</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  value={formData.contactPersonEmail}
                  onChange={(e) => handleChange("contactPersonEmail", e.target.value)}
                  placeholder="contato@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">Telefone da Pessoa de Contato</Label>
                <Input
                  id="contactPersonPhone"
                  type="tel"
                  value={formData.contactPersonPhone}
                  onChange={(e) => handleChange("contactPersonPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
