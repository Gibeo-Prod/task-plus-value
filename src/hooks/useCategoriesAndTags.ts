
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

  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, color, icon }: { name: string, color: string, icon: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('task_categories')
        .insert({
          user_id: user.id,
          name: name,
          color: color,
          icon: icon
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Categoria criada",
        description: "Nova categoria criada com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive"
      })
    }
  })

  const addTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string, color: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('task_tags')
        .insert({
          user_id: user.id,
          name: name,
          color: color
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast({
        title: "Etiqueta criada",
        description: "Nova etiqueta criada com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar etiqueta: " + error.message,
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
