
export const validateInvite = (invite: any) => {
  // Check if invite has expired
  const now = new Date()
  const expiresAt = new Date(invite.expires_at)
  
  if (now > expiresAt) {
    return { isValid: false, error: "Este convite expirou" }
  }

  return { isValid: true, error: null }
}
