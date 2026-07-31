import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import * as products from '../products/product.service.js';

type Tool = {
  definition: Anthropic.Tool;
  run: (rawInput: unknown) => Promise<unknown>;
};

const searchInput = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  limit: z.number().int().min(1).max(20).default(8),
});

const searchProducts: Tool = {
  definition: {
    name: 'search_products',
    description:
      'Consulta o catálogo de produtos da empresa do usuário. Use sempre que a pergunta ' +
      'envolver produtos, preços, disponibilidade ou comparações. Combine os filtros ' +
      'livremente; sem filtros, retorna os produtos mais recentes.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Termo livre buscado em nome, descrição e categoria' },
        category: { type: 'string', description: 'Categoria exata, obtida via list_categories' },
        minPrice: { type: 'number', description: 'Preço mínimo em reais' },
        maxPrice: { type: 'number', description: 'Preço máximo em reais' },
        limit: { type: 'number', description: 'Máximo de resultados (1 a 20, padrão 8)' },
      },
      additionalProperties: false,
    },
  },
  async run(rawInput) {
    const input = searchInput.parse(rawInput ?? {});
    const { items, total } = await products.list({ ...input, page: 1 });

    return {
      total,
      returned: items.length,
      products: items.map((p) => ({
        id: String(p._id),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        available: p.active && p.stock > 0,
      })),
    };
  },
};

const listCategories: Tool = {
  definition: {
    name: 'list_categories',
    description:
      'Lista as categorias existentes no catálogo da empresa. Use antes de filtrar por ' +
      'categoria ou quando o usuário perguntar o que a loja vende.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  async run() {
    const categories = await products.categories();
    return { categories };
  },
};

const TOOLS = new Map<string, Tool>(
  [searchProducts, listCategories].map((tool) => [tool.definition.name, tool]),
);

export const toolDefinitions: Anthropic.Tool[] = [...TOOLS.values()].map((t) => t.definition);

export async function runTool(name: string, input: unknown): Promise<unknown> {
  const tool = TOOLS.get(name);
  if (!tool) return { error: `Ferramenta desconhecida: ${name}` };

  try {
    return await tool.run(input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Falha ao consultar o catálogo' };
  }
}
