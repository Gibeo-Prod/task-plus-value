
import { supabase } from "@/integrations/supabase/client"

export const debugTokenSearch = async (token: string) => {
  console.log('Fetching invite with token:', token)
  console.log('Token length:', token.length)
  console.log('Token type:', typeof token)

  // Primeiro, vamos fazer uma busca geral para ver quantos convites existem
  const { data: allInvites, error: countError } = await supabase
    .from('project_invites')
    .select('token, id, recipient_name, created_at')
    .limit(10)

  console.log('Total invites in database (sample):', allInvites?.length || 0)
  console.log('All invite details:', allInvites)
  
  if (allInvites && allInvites.length > 0) {
    console.log('Exact token comparison:')
    allInvites.forEach((inv, index) => {
      const matches = inv.token === token
      console.log(`${index + 1}. DB Token: "${inv.token}" (length: ${inv.token?.length || 0}) | Matches: ${matches}`)
      if (inv.token && token) {
        // Check character by character for debugging
        let diffFound = false
        for (let i = 0; i < Math.max(inv.token.length, token.length); i++) {
          if (inv.token[i] !== token[i]) {
            console.log(`   Diff at position ${i}: DB="${inv.token[i] || 'undefined'}" vs Input="${token[i] || 'undefined'}"`)
            diffFound = true
            break
          }
        }
        if (!diffFound && inv.token.length === token.length) {
          console.log('   Tokens are identical character by character')
        }
      }
    })
  }

  return { allInvites, countError }
}

export const searchSimilarTokens = async (token: string) => {
  console.log('Trying alternative query approaches...')
  
  // Try with ilike (case insensitive)
  const { data: ilikeResult } = await supabase
    .from('project_invites')
    .select('token, id')
    .ilike('token', token)
  
  console.log('Case-insensitive search result:', ilikeResult)
  
  // Try to find partial matches
  const { data: similarTokens } = await supabase
    .from('project_invites')
    .select('token, id, recipient_name')
    .or(`token.like.%${token.substring(0, 8)}%,token.like.%${token.substring(-8)}%`)
    .limit(5)
  
  console.log('Similar tokens found:', similarTokens)
  
  return { ilikeResult, similarTokens }
}
