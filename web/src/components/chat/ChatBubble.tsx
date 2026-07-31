type Props = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatBubble({ role, content }: Props) {
  const isUser = role === 'user';

  return (
    <div
      className={[
        'max-w-[min(42rem,85%)] px-4 py-3 text-sm whitespace-pre-wrap wrap-anywhere',
        isUser
          ? 'self-end bg-indigo text-white'
          : 'self-start border border-rule bg-surface text-ink',
      ].join(' ')}
    >
      {content}
    </div>
  );
}
