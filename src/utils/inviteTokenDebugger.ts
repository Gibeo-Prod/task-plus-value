
import { supabase } from "@/integrations/supabase/client"
import { isValidTokenFormat, getTokenSearchPatterns } from "./tokenHandler"

export const debugTokenSearch = async (token: string) => {
  console.log('=== TOKEN DEBUG START ===')
  console.log('Input token:', token)
  console.log('Token length:', token.length)
  console.log('Token type:', typeof token)
  console.log('Is valid format:', isValidTokenFormat(token))
  
  const patterns = getTokenSearchPatterns(token)
  console.log('Search patterns:', patterns)

  // Fetch sample invites to compare
  const { data: allInvites, error: countError } = await supabase
    .from('project_invites')
    .select('token, id, recipient_name, created_at')
    .limit(10)

  console.log('Total invites in database (sample):', allInvites?.length || 0)
  
  if (allInvites && allInvites.length > 0) {
    console.log('Token format analysis:')
    allInvites.forEach((inv, index) => {
      const dbToken = inv.token
      const exactMatch = dbToken === token
      const caseInsensitiveMatch = dbToken?.toLowerCase() === token.toLowerCase()
      
      console.log(`${index + 1}. DB Token: "${dbToken}"`)
      console.log(`   Length: ${dbToken?.length || 0}`)
      console.log(`   Format: ${dbToken?.includes('-') ? 'UUID' : 'Short'}`)
      console.log(`   Exact match: ${exactMatch}`)
      console.log(`   Case-insensitive match: ${caseInsensitiveMatch}`)
      
      if (dbToken && token && !exactMatch && dbToken.length === token.length) {
        // Character by character comparison for debugging
        for (let i = 0; i < Math.min(dbToken.length, token.length); i++) {
          if (dbToken[i] !== token[i]) {
            console.log(`   First difference at position ${i}: DB="${dbToken[i]}" vs Input="${token[i]}"`)
            break
          }
        }
      }
    })
  }

  console.log('=== TOKEN DEBUG END ===')
  return { allInvites, countError }
}

export const searchSimilarTokens = async (token: string) => {
  console.log('Searching for similar tokens...')
  
  // Try case-insensitive search
  const { data: ilikeResult } = await supabase
    .from('project_invites')
    .select('token, id, recipient_name')
    .ilike('token', token)
  
  console.log('Case-insensitive search result:', ilikeResult)
  
  // Try partial matches for debugging
  if (token.length >= 8) {
    const { data: similarTokens } = await supabase
      .from('project_invites')
      .select('token, id, recipient_name')
      .or(`token.like.%${token.substring(0, 8)}%,token.like.%${token.substring(-8)}%`)
      .limit(5)
    
    console.log('Partial match results:', similarTokens)
    return { ilikeResult, similarTokens }
  }
  
  return { ilikeResult, similarTokens: [] }
}
