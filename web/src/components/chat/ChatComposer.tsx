import { useState, type KeyboardEvent } from 'react';
import { Button } from '../ui/Button';

type Props = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export function ChatComposer({ disabled, onSend }: Props) {
  const [draft, setDraft] = useState('');

  function submit() {
    const message = draft.trim();
    if (!message || disabled) return;
    setDraft('');
    onSend(message);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex gap-2 border-t border-rule bg-surface px-5 py-4 lg:px-7">
      <textarea
        rows={1}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Mensagem para o assistente"
        placeholder="Pergunte sobre o catálogo"
        className="max-h-40 min-h-11 flex-1 resize-none overflow-y-auto border border-rule bg-paper px-3 py-2.5 text-sm placeholder:text-ink-soft/70 focus:border-indigo focus:outline-none disabled:opacity-60"
      />
      <Button variant="primary" onClick={submit} disabled={disabled || !draft.trim()}>
        Enviar
      </Button>
    </div>
  );
}
