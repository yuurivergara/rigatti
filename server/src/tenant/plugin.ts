import { Schema, Types, type Query, type Aggregate } from 'mongoose';
import { requireTenant } from './context.js';

const GUARDED_QUERIES =
  /^(count|countDocuments|distinct|find|findOne|findOneAndDelete|findOneAndReplace|findOneAndUpdate|replaceOne|updateOne|updateMany|deleteOne|deleteMany)$/;

/**
 * Injeta o filtro de tenant em toda query e faz a query falhar quando não há
 * tenant no contexto. O isolamento deixa de depender de o dev lembrar do
 * `{ companyId }` em cada chamada.
 */
export function tenantPlugin(schema: Schema): void {
  schema.add({
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  });

  schema.pre(GUARDED_QUERIES, function (this: Query<unknown, unknown>) {
    this.where({ companyId: new Types.ObjectId(requireTenant()) });
  });

  schema.pre('aggregate', function (this: Aggregate<unknown[]>) {
    this.pipeline().unshift({ $match: { companyId: new Types.ObjectId(requireTenant()) } });
  });

  // O contexto é a autoridade: um companyId que venha no payload é sobrescrito,
  // nunca respeitado.
  schema.pre('validate', function (this: { isNew: boolean; companyId?: unknown }) {
    if (this.isNew) {
      this.companyId = new Types.ObjectId(requireTenant());
    }
  });

  schema.pre('insertMany', function (next, docs: Array<{ companyId?: unknown }>) {
    const companyId = new Types.ObjectId(requireTenant());
    for (const doc of docs) doc.companyId = companyId;
    next();
  });

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.companyId;
      return ret;
    },
  });
}
