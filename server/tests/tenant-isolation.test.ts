import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Product } from '../src/modules/products/product.model.js';
import { runInTenant } from '../src/tenant/context.js';
import * as productService from '../src/modules/products/product.service.js';
import { runTool } from '../src/modules/chat/agent.tools.js';
import { startDb, stopDb, resetDb, createTenant, type Tenant } from './helpers.js';

describe('isolamento multi-tenant', () => {
  let alpha: Tenant;
  let beta: Tenant;

  beforeAll(startDb);
  afterAll(stopDb);

  beforeEach(async () => {
    await resetDb();
    alpha = await createTenant('Alpha', ['Cadeira Alpha', 'Mesa Alpha']);
    beta = await createTenant('Beta', ['Notebook Beta']);
  });

  it('só enxerga produtos do próprio tenant', async () => {
    const fromAlpha = await runInTenant(alpha.companyId, () =>
      productService.list({ page: 1, limit: 50 }),
    );
    const fromBeta = await runInTenant(beta.companyId, () =>
      productService.list({ page: 1, limit: 50 }),
    );

    expect(fromAlpha.items.map((p) => p.name).sort()).toEqual(['Cadeira Alpha', 'Mesa Alpha']);
    expect(fromBeta.items.map((p) => p.name)).toEqual(['Notebook Beta']);
  });

  it('não devolve produto de outro tenant nem sabendo o id', async () => {
    const [alphaProduct] = await runInTenant(alpha.companyId, () =>
      productService.list({ page: 1, limit: 1 }),
    ).then((r) => r.items);

    await expect(
      runInTenant(beta.companyId, () => productService.getById(String(alphaProduct!._id))),
    ).rejects.toThrow(/não encontrado/i);
  });

  it('não atualiza nem apaga produto de outro tenant', async () => {
    const [alphaProduct] = await runInTenant(alpha.companyId, () =>
      productService.list({ page: 1, limit: 1 }),
    ).then((r) => r.items);
    const id = String(alphaProduct!._id);

    await expect(
      runInTenant(beta.companyId, () => productService.update(id, { price: 1 })),
    ).rejects.toThrow(/não encontrado/i);
    await expect(runInTenant(beta.companyId, () => productService.remove(id))).rejects.toThrow(
      /não encontrado/i,
    );

    const untouched = await runInTenant(alpha.companyId, () => productService.getById(id));
    expect(untouched.price).toBe(alphaProduct!.price);
  });

  it('recusa a query quando não há tenant no contexto', async () => {
    await expect(Product.find({})).rejects.toThrow(/tenant/i);
    await expect(Product.countDocuments({})).rejects.toThrow(/tenant/i);
  });

  it('escreve o produto no tenant do contexto, ignorando companyId forjado', async () => {
    await runInTenant(alpha.companyId, () =>
      productService.create({
        name: 'Injetado',
        description: 'Tentativa de gravar em outro tenant',
        price: 10,
        category: 'Geral',
        stock: 1,
        active: true,
        // @ts-expect-error: campo não existe no schema de entrada — o teste garante que é ignorado
        companyId: beta.companyId,
      }),
    );

    const inBeta = await runInTenant(beta.companyId, () =>
      productService.list({ page: 1, limit: 50 }),
    );
    expect(inBeta.items.map((p) => p.name)).not.toContain('Injetado');
  });

  it('a tool do agente respeita o tenant', async () => {
    const alphaResult = (await runInTenant(alpha.companyId, () =>
      runTool('search_products', { limit: 20 }),
    )) as { products: Array<{ name: string }> };

    const betaResult = (await runInTenant(beta.companyId, () =>
      runTool('search_products', { search: 'Alpha', limit: 20 }),
    )) as { products: Array<{ name: string }> };

    expect(alphaResult.products.map((p) => p.name).sort()).toEqual(['Cadeira Alpha', 'Mesa Alpha']);
    expect(betaResult.products).toHaveLength(0);
  });
});
