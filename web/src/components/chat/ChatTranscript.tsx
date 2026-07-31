import { useEffect, useRef } from 'react';
import type { ChatEntry } from '../../hooks/useChatSession';
import { Alert } from '../ui/Feedback';
import { ChatBubble } from './ChatBubble';
import { ChatWelcome } from './ChatWelcome';
import { ThinkingIndicator, ToolTrace } from './ToolTrace';

type Props = {
  entries: ChatEntry[];
  streaming: boolean;
  error: string | null;
  onPickSuggestion: (question: string) => void;
};

export function ChatTranscript({ entries, streaming, error, onPickSuggestion }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  const waitingForFirstToken = streaming && entries.at(-1)?.kind === 'message';

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6 md:px-7"
      aria-live="polite"
    >
      {entries.length === 0 && <ChatWelcome onPick={onPickSuggestion} />}

      {entries.map((entry, index) =>
        entry.kind === 'tool' ? (
          <ToolTrace key={index} name={entry.name} />
        ) : (
          <ChatBubble key={index} role={entry.role} content={entry.content} />
        ),
      )}

      {waitingForFirstToken && <ThinkingIndicator />}
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
