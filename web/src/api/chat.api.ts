import { BASE_URL, ApiError, authHeaders, jsonBody, request } from './http';
import type { AgentEvent, ChatMessage } from './types';

export const chatApi = {
  history: () => request<ChatMessage[]>('/api/chat/history'),

  clear: () => request<void>('/api/chat/history', { method: 'DELETE' }),

  /** Consome o SSE do agente e entrega um evento por vez ao chamador. */
  async stream(
    message: string,
    onEvent: (event: AgentEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: jsonBody({ message }),
      signal,
    });

    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(response.status, payload?.error?.message ?? 'O assistente não respondeu');
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += value;
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const data = frame.replace(/^data: /, '').trim();
        if (data) onEvent(JSON.parse(data) as AgentEvent);
      }
    }
  },
};
