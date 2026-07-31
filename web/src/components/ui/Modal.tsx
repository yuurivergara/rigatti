import { useEffect, type ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    // Quem rola é o overlay, não o diálogo: com a rolagem interna, focar um
    // campo em conteúdo que estoura por poucos pixels fazia a caixa pular.
    <div
      className="fixed inset-0 z-20 overflow-y-auto bg-ink/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-lg border border-rule bg-surface p-6"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 className="mb-5 text-lg">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
