import { useChatSession } from '../hooks/useChatSession';
import { PageHeader } from '../components/layout/AppShell';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatTranscript } from '../components/chat/ChatTranscript';
import { Button } from '../components/ui/Button';

export function ChatPage() {
  const { entries, streaming, error, send, clear } = useChatSession();

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
        onPickSuggestion={(question) => void send(question)}
      />

      <ChatComposer disabled={streaming} onSend={(message) => void send(message)} />
    </>
  );
}
