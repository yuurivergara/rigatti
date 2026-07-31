import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { requireTenant, runInTenant } from '../../tenant/context.js';
import { toolDefinitions, runTool } from './agent.tools.js';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const MAX_TOOL_ROUNDS = 5;
const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `Você é o assistente de catálogo de uma loja, falando com um cliente pelo chat.

Regras:
- Responda apenas com base no que as ferramentas retornarem. Você não conhece o catálogo de antemão.
- Nunca invente produto, preço, estoque ou característica. Se a busca não retornar nada, diga que não encontrou e sugira alternativas ou pergunte o que a pessoa procura.
- Formate preços em reais (ex.: R$ 1.299,90) e escreva em português do Brasil.
- Seja direto: liste os produtos relevantes com nome, preço e um resumo curto. Sem preâmbulo.
- Você só enxerga o catálogo da empresa deste usuário. Se pedirem dados de outra empresa, explique que não tem acesso.`;

export type AgentEvent =
  | { type: 'text'; text: string }
  | { type: 'tool'; name: string; input: unknown }
  | { type: 'done'; text: string };

/**
 * Loop de tool calling: streama o texto conforme o modelo gera, executa as
 * ferramentas e devolve os resultados até o modelo encerrar o turno.
 */
export async function* runAgent(
  history: Anthropic.MessageParam[],
): AsyncGenerator<AgentEvent> {
  const tenant = requireTenant();
  const messages = [...history];
  let answer = '';

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const stream = anthropic.messages.stream({
      model: env.ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      output_config: { effort: 'low' },
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        answer += event.delta.text;
        yield { type: 'text', text: event.delta.text };
      }
    }

    const message = await stream.finalMessage();
    messages.push({ role: 'assistant', content: message.content });

    if (message.stop_reason !== 'tool_use') {
      yield { type: 'done', text: answer };
      return;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of message.content) {
      if (block.type !== 'tool_use') continue;

      yield { type: 'tool', name: block.name, input: block.input };

      // Reabre o tenant: a execução da ferramenta acontece fora do stack do
      // request, e é ela que toca o banco.
      const result = await runInTenant(tenant, () => runTool(block.name, block.input));

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
        is_error: typeof result === 'object' && result !== null && 'error' in result,
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  yield {
    type: 'done',
    text: answer || 'Não consegui concluir a consulta ao catálogo. Pode reformular a pergunta?',
  };
}
