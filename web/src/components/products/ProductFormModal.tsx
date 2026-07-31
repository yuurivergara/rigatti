import { useState } from 'react';
import { productsApi } from '../../api/products.api';
import { errorMessage } from '../../api/http';
import type { Product, ProductInput } from '../../api/types';
import { Button } from '../ui/Button';
import { Checkbox, Field, TextArea, TextInput } from '../ui/Field';
import { Alert } from '../ui/Feedback';
import { Modal } from '../ui/Modal';
import { ImageManager } from './ImageManager';

type Props = {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
};

const toFormState = (product: Product | null) => ({
  name: product?.name ?? '',
  description: product?.description ?? '',
  price: product ? String(product.price) : '',
  category: product?.category ?? '',
  stock: product ? String(product.stock) : '0',
  images: product?.images ?? [],
  active: product?.active ?? true,
});

export function ProductFormModal({ product, categories, onClose, onSaved }: Props) {
  const [form, setForm] = useState(toFormState(product));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function save() {
    setSaving(true);
    setError(null);

    const payload: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      images: form.images,
      active: form.active,
    };

    try {
      if (product) await productsApi.update(product.id, payload);
      else await productsApi.create(payload);
      onSaved();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível salvar o produto'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={product ? 'Editar produto' : 'Novo produto'} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Field label="Nome">
          <TextInput
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </Field>

        <Field label="Descrição" hint="O assistente usa este texto para responder aos clientes.">
          <TextArea
            required
            minLength={2}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço (R$)">
            <TextInput
              className="numeric w-full"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
            />
          </Field>
          <Field label="Estoque">
            <TextInput
              className="numeric w-full"
              type="number"
              min="0"
              step="1"
              required
              value={form.stock}
              onChange={(event) => update('stock', event.target.value)}
            />
          </Field>
        </div>

        <Field label="Categoria">
          <TextInput
            required
            minLength={2}
            list="categorias"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
          />
          <datalist id="categorias">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>

        <ImageManager
          images={form.images}
          onChange={(images) => update('images', images)}
          onError={setError}
        />

        <Checkbox
          label="Visível no catálogo"
          checked={form.active}
          onChange={(event) => update('active', event.target.checked)}
        />

        {error && <Alert>{error}</Alert>}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar produto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
