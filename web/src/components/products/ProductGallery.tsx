import { useEffect, useState, type KeyboardEvent } from 'react';

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  // Trocar de produto sem remontar o componente deixaria o índice antigo.
  useEffect(() => setIndex(0), [images]);

  if (images.length === 0) {
    return (
      <div className="grid aspect-4/3 w-full place-items-center border border-rule bg-paper font-mono text-xs text-ink-soft">
        sem imagem
      </div>
    );
  }

  const go = (next: number) => setIndex((next + images.length) % images.length);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="galeria"
        aria-label={`Imagens de ${alt}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative border border-rule bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo"
      >
        <img src={images[index]} alt={`${alt} — imagem ${index + 1}`} className="aspect-4/3 w-full object-cover" />

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(index - 1)} />
            <GalleryArrow side="right" onClick={() => go(index + 1)} />
            <p className="numeric absolute right-2 bottom-2 border border-rule bg-surface/90 px-1.5 py-0.5 text-[11px]">
              {index + 1}/{images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((image, position) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Ver imagem ${position + 1}`}
                aria-current={position === index}
                className={`block size-14 overflow-hidden border transition-colors ${
                  position === index ? 'border-indigo' : 'border-rule hover:border-rule-strong'
                }`}
              >
                <img src={image} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Imagem anterior' : 'Próxima imagem'}
      className={`absolute top-1/2 -translate-y-1/2 border border-rule bg-surface/90 px-2 py-3 text-ink-soft transition-colors hover:text-indigo ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      <span aria-hidden>{side === 'left' ? '‹' : '›'}</span>
    </button>
  );
}
