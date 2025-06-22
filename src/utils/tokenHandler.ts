
/**
 * Utility functions for handling project invite tokens
 * Supports both UUID and short token formats
 */

// Generate a short token (20 characters) for easier sharing
export const generateShortToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate UUID token (for backward compatibility)
export const generateUUIDToken = (): string => {
  return crypto.randomUUID()
}

// Convert short token to search patterns for database lookup
export const getTokenSearchPatterns = (token: string) => {
  // If it's already a UUID format (36 chars with dashes), use as-is
  if (token.length === 36 && token.includes('-')) {
    return {
      exact: token,
      isUUID: true
    }
  }
  
  // If it's a short token (20 chars), we need to search differently
  if (token.length === 20) {
    return {
      exact: token,
      isUUID: false
    }
  }
  
  // For other lengths, try both approaches
  return {
    exact: token,
    isUUID: token.includes('-') && token.length > 20
  }
}

// Validate token format
export const isValidTokenFormat = (token: string): boolean => {
  if (!token) return false
  
  // Accept UUID format (36 chars with dashes)
  if (token.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return true
  }
  
  // Accept short token format (20 alphanumeric chars)
  if (token.length === 20 && /^[A-Za-z0-9]{20}$/.test(token)) {
    return true
  }
  
  return false
}
