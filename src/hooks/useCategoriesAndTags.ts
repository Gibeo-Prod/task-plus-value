
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { TaskCategory, TaskTag } from '@/types/tasks'
import { mapCategoryFromSupabase, mapTagFromSupabase } from '@/utils/supabaseDataMappers'

export const useCategoriesAndTags = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  console.log('useCategoriesAndTags hook - user:', user?.id, 'email:', user?.email)

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useCategoriesAndTags: No user found for categories, returning empty array')
        return []
      }
      console.log('Fetching categories for user:', user.id)
      
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
      
      console.log('Categories fetched successfully:', data?.length || 0, 'categories')
      return data.map(mapCategoryFromSupabase) as TaskCategory[]
    },
    enabled: !!user
  })

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useCategoriesAndTags: No user found for tags, returning empty array')
        return []
      }
      console.log('Fetching tags for user:', user.id)
      
      const { data, error } = await supabase
        .from('task_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching tags:', error)
        throw error
      }
      
      console.log('Tags fetched successfully:', data?.length || 0, 'tags')
      return data.map(mapTagFromSupabase) as TaskTag[]
    },
    enabled: !!user
  })

  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, color, icon }: { name: string, color: string, icon: string }) => {
      if (!user) {
        console.error('addCategoryMutation: User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('addCategoryMutation: Starting with data:', { name, color, icon })
      console.log('addCategoryMutation: User info:', { id: user.id, email: user.email })
      
      const categoryData = {
        user_id: user.id,
        name: name.trim(),
        color: color,
        icon: icon || 'folder'
      }
      
      console.log('addCategoryMutation: Database category object:', categoryData)
      
      const { data, error } = await supabase
        .from('task_categories')
        .insert(categoryData)
        .select()
        .single()
      
      if (error) {
        console.error('addCategoryMutation: Database error:', error)
        console.error('addCategoryMutation: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('addCategoryMutation: Category created successfully:', data)
      return data
    },
    onSuccess: () => {
      console.log('addCategoryMutation: Success callback, invalidating queries')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Categoria criada",
        description: "Nova categoria criada com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('addCategoryMutation: Error callback:', error)
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Erro desconhecido ao criar categoria",
        variant: "destructive"
      })
    }
  })

  const addTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string, color: string }) => {
      if (!user) {
        console.error('addTagMutation: User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('addTagMutation: Starting with data:', { name, color })
      console.log('addTagMutation: User info:', { id: user.id, email: user.email })
      
      const tagData = {
        user_id: user.id,
        name: name.trim(),
        color: color
      }
      
      console.log('addTagMutation: Database tag object:', tagData)
      
      const { data, error } = await supabase
        .from('task_tags')
        .insert(tagData)
        .select()
        .single()
      
      if (error) {
        console.error('addTagMutation: Database error:', error)
        console.error('addTagMutation: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('addTagMutation: Tag created successfully:', data)
      return data
    },
    onSuccess: () => {
      console.log('addTagMutation: Success callback, invalidating queries')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast({
        title: "Etiqueta criada",
        description: "Nova etiqueta criada com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('addTagMutation: Error callback:', error)
      toast({
        title: "Erro ao criar etiqueta",
        description: error.message || "Erro desconhecido ao criar etiqueta",
        variant: "destructive"
      })
    }
  })

  return {
    categories,
    categoriesLoading,
    tags,
    tagsLoading,
    addCategory: (name: string, color: string, icon: string) => 
      addCategoryMutation.mutate({ name, color, icon }),
    addTag: (name: string, color: string) => 
      addTagMutation.mutate({ name, color })
  }
}
