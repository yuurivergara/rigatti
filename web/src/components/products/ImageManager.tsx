import { useState, type DragEvent } from 'react';
import { productsApi } from '../../api/products.api';
import { errorMessage } from '../../api/http';

const MAX_IMAGES = 8;

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  onError: (message: string | null) => void;
};

export function ImageManager({ images, onChange, onError }: Props) {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);

  const remaining = MAX_IMAGES - images.length;
  const full = remaining <= 0;

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed || images.includes(trimmed) || full) return;
    onChange([...images, trimmed]);
    setUrl('');
  }

  async function upload(files: File[]) {
    const selected = files.filter((file) => file.type.startsWith('image/')).slice(0, remaining);
    if (selected.length === 0) return;

    setUploading(true);
    onError(null);
    try {
      const uploaded = await Promise.all(selected.map((file) => productsApi.uploadImage(file)));
      onChange([...images, ...uploaded.map((result) => result.url)]);
    } catch (err) {
      onError(errorMessage(err, 'Não foi possível enviar as imagens'));
    } finally {
      setUploading(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingOver(false);
    if (!full) void upload([...event.dataTransfer.files]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow">imagens</span>
        <span className="numeric text-[11px] text-ink-soft">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDraggingOver(true);
        }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={onDrop}
        className={`flex flex-col gap-3 border border-dashed p-3 transition-colors ${
          draggingOver ? 'border-indigo bg-indigo-soft' : 'border-rule-strong'
        }`}
      >
        {images.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <li key={image} className="relative">
                <img
                  src={image}
                  alt=""
                  className={`size-16 border object-cover ${index === 0 ? 'border-indigo' : 'border-rule'}`}
                />

                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 bg-indigo text-center font-mono text-[9px] text-white">
                    capa
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onChange([image, ...images.filter((item) => item !== image)])}
                    className="absolute inset-x-0 bottom-0 bg-surface/90 text-center font-mono text-[9px] text-ink-soft hover:text-indigo"
                  >
                    usar capa
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onChange(images.filter((item) => item !== image))}
                  aria-label={`Remover imagem ${index + 1}`}
                  className="absolute -top-1.5 -right-1.5 size-5 border border-rule bg-surface text-[11px] leading-none text-ink-soft hover:border-signal hover:text-signal"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="text-center">
          <label
            className={`inline-block border border-rule bg-surface px-3 py-2 text-[13px] ${
              full || uploading ? 'opacity-50' : 'cursor-pointer hover:border-indigo hover:text-indigo'
            }`}
          >
            {uploading ? 'Enviando…' : 'Escolher do computador'}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={full || uploading}
              onChange={(event) => {
                if (event.target.files) void upload([...event.target.files]);
                event.target.value = '';
              }}
            />
          </label>
          <p className="mt-1.5 font-mono text-[11px] text-ink-soft">
            {full ? 'limite de 8 imagens atingido' : 'ou arraste os arquivos aqui'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addUrl();
            }
          }}
          placeholder="ou cole o endereço de uma imagem"
          aria-label="URL da imagem"
          disabled={full}
          className="flex-1 rounded-[var(--radius-card)] border border-rule bg-surface px-3 py-2 text-sm placeholder:text-ink-soft/70 focus:border-indigo focus:outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={addUrl}
          disabled={!url.trim() || full}
          className="border border-rule px-3 text-[13px] hover:bg-paper disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
