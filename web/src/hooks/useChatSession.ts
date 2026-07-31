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

      try {
        await chatApi.stream(message, (event) => {
          if (event.type === 'tool') {
            setEntries((prev) => [...prev, { kind: 'tool', name: event.name }]);
            return;
          }

          if (event.type === 'text') {
            // Deriva tudo de `prev`: um updater que dependesse de flag externa
            // perderia texto quando o React reexecuta o updater.
            setEntries((prev) => {
              const last = prev.at(-1);
              const isOpenBubble = last?.kind === 'message' && last.role === 'assistant';

              return isOpenBubble
                ? [...prev.slice(0, -1), { ...last, content: last.content + event.text }]
                : [...prev, { kind: 'message', role: 'assistant', content: event.text }];
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
