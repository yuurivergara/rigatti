import { AsyncLocalStorage } from 'node:async_hooks';

type TenantStore = {
  companyId: string;
  system?: boolean;
};

const storage = new AsyncLocalStorage<TenantStore>();

export function runInTenant<T>(companyId: string, fn: () => T): T {
  return storage.run({ companyId: String(companyId) }, fn);
}

/** Escape hatch para scripts (seed) que legitimamente iteram entre tenants. */
export function runAsSystem<T>(companyId: string, fn: () => T): T {
  return storage.run({ companyId: String(companyId), system: true }, fn);
}

export function currentTenant(): string | undefined {
  return storage.getStore()?.companyId;
}

export function requireTenant(): string {
  const companyId = storage.getStore()?.companyId;
  if (!companyId) {
    throw new Error(
      'Nenhum tenant no contexto: query multi-tenant executada fora de runInTenant().',
    );
  }
  return companyId;
}
