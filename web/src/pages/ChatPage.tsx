import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatSession } from '../hooks/useChatSession';
import { PageHeader } from '../components/layout/AppShell';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatTranscript } from '../components/chat/ChatTranscript';
import { Button } from '../components/ui/Button';

type ChatLocationState = { question?: string } | null;

export function ChatPage() {
  const { entries, streaming, error, send, clear } = useChatSession();
  const location = useLocation();
  const navigate = useNavigate();
  const question = (location.state as ChatLocationState)?.question;
  const alreadySent = useRef(false);

  // Pergunta vinda da ficha do produto: dispara uma vez e limpa o state para
  // que um refresh não reenvie.
  useEffect(() => {
    if (!question || alreadySent.current) return;
    alreadySent.current = true;
    navigate(location.pathname, { replace: true, state: null });
    void send(question);
  }, [question, send, navigate, location.pathname]);

  return (
    <>
      <PageHeader
        title="Assistente"
        subtitle="Responde consultando os produtos reais da sua empresa."
        actions={
          entries.length > 0 && (
            <Button onClick={() => void clear()} disabled={streaming}>
              Limpar conversa
            </Button>
          )
        }
      />

      <ChatTranscript
        entries={entries}
        streaming={streaming}
        error={error}
        onPickSuggestion={(suggestion) => void send(suggestion)}
      />

      <ChatComposer disabled={streaming} onSend={(message) => void send(message)} />
    </>
  );
}
