
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, message, messageHistory } = await req.json();

    // Get project details from database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Projeto não encontrado');
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', project.client_id)
      .single();

    if (clientError || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Get project tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
    }

    // Prepare context for AI
    const projectContext = `
Projeto: ${project.name}
Descrição: ${project.description || 'Sem descrição'}
Cliente: ${client.name} (${client.company || 'Sem empresa'})
Status: ${project.status}
Prioridade: ${project.priority}
Valor: R$ ${project.value}
Data de início: ${project.start_date}
Data de entrega: ${project.due_date || 'Não definida'}
Progresso: ${project.progress}%

Tarefas do projeto (${tasks?.length || 0}):
${tasks?.map(task => `- ${task.title} (${task.completed ? 'Concluída' : 'Pendente'}) - ${task.description || 'Sem descrição'}`).join('\n') || 'Nenhuma tarefa'}
`;

    // Prepare message history for context
    const contextMessages = messageHistory?.slice(-5).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })) || [];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente inteligente especializado em gestão de projetos. Você está ajudando com um projeto específico. 

Contexto do projeto:
${projectContext}

Instruções:
- Responda sempre em português brasileiro
- Seja objetivo e útil
- Foque no contexto do projeto atual
- Ajude com planejamento, organização e sugestões
- Se perguntado sobre tarefas, use as informações fornecidas
- Mantenha um tom profissional mas amigável
- Limite suas respostas a 200 palavras quando possível`
          },
          ...contextMessages,
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in project-chat-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        response: 'Desculpe, não foi possível processar sua mensagem no momento. Tente novamente.'
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
