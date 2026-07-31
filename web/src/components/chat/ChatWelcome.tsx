const SUGGESTIONS = [
  'Quais categorias vocês têm?',
  'Mostre as opções abaixo de R$ 1.000',
  'Qual é o produto mais caro do catálogo?',
  'O que está sem estoque?',
];

export function ChatWelcome({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="m-auto max-w-md text-center">
      <p className="eyebrow">assistente de catálogo</p>
      <h2 className="mt-2 text-xl font-semibold">Pergunte sobre os produtos</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Cada resposta passa por uma consulta ao banco da sua empresa. O assistente não inventa
        produto nem preço — e não enxerga o catálogo de outra empresa.
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((question) => (
          <li key={question}>
            <button
              onClick={() => onPick(question)}
              className="border border-rule px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-indigo hover:text-indigo"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
