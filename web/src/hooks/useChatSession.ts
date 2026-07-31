import { useCallback, useEffect, useState } from 'react';
import { chatApi } from '../api/chat.api';
import { errorMessage } from '../api/http';

export type ChatEntry =
  | { kind: 'message'; role: 'user' | 'assistant'; content: string }
  | { kind: 'tool'; name: string };

export function useChatSession() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chatApi
      .history()
      .then((history) =>
        setEntries(history.map((m) => ({ kind: 'message', role: m.role, content: m.content }))),
      )
      .catch(() => undefined);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message) return;

      setError(null);
      setStreaming(true);
      setEntries((prev) => [...prev, { kind: 'message', role: 'user', content: message }]);

      // Cada rodada de tool call inicia uma nova bolha do assistente.
      let openBubble = false;

      try {
        await chatApi.stream(message, (event) => {
          if (event.type === 'tool') {
            openBubble = false;
            setEntries((prev) => [...prev, { kind: 'tool', name: event.name }]);
            return;
          }

          if (event.type === 'text') {
            setEntries((prev) => {
              if (!openBubble) {
                openBubble = true;
                return [...prev, { kind: 'message', role: 'assistant', content: event.text }];
              }
              const last = prev.at(-1);
              if (last?.kind !== 'message') return prev;
              return [...prev.slice(0, -1), { ...last, content: last.content + event.text }];
            });
            return;
          }

          if (event.type === 'error') setError(event.message);
        });
      } catch (err) {
        setError(errorMessage(err, 'Falha ao falar com o assistente'));
      } finally {
        setStreaming(false);
      }
    },
    [],
  );

  const clear = useCallback(async () => {
    await chatApi.clear();
    setEntries([]);
    setError(null);
  }, []);

  return { entries, streaming, error, send, clear };
}
