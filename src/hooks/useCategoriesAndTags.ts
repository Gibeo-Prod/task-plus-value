
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { TaskCategory, TaskTag } from '@/types/tasks'
import { mapCategoryFromSupabase, mapTagFromSupabase } from '@/utils/supabaseDataMappers'

export const useCategoriesAndTags = () => {
  const { user } = useAuth()

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(mapCategoryFromSupabase) as TaskCategory[]
    },
    enabled: !!user
  })

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('task_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(mapTagFromSupabase) as TaskTag[]
    },
    enabled: !!user
  })

  return {
    categories,
    categoriesLoading,
    tags,
    tagsLoading
  }
}
