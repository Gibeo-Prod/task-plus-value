
import { isValidTokenFormat } from "./tokenHandler"

export const validateInvite = (invite: any) => {
  // Check if invite exists
  if (!invite) {
    return { isValid: false, error: "Convite não encontrado" }
  }

  // Check if invite has expired
  const now = new Date()
  const expiresAt = new Date(invite.expires_at)
  
  if (now > expiresAt) {
    return { isValid: false, error: "Este convite expirou" }
  }

  // Check if invite has already been used
  if (invite.used_at) {
    return { isValid: false, error: "Este convite já foi utilizado" }
  }

  return { isValid: true, error: null }
}

export const validateToken = (token: string) => {
  if (!token) {
    return { isValid: false, error: "Token de convite não fornecido" }
  }

  if (!isValidTokenFormat(token)) {
    return { isValid: false, error: "Formato de token inválido" }
  }

  return { isValid: true, error: null }
}
