import { Schema, model, type Types } from 'mongoose';

/**
 * Sem tenantPlugin de propósito: o GET é público (serve `<img src>`, que não
 * carrega Authorization). O companyId fica só para rastreio/limpeza.
 */
const imageSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

export type ImageDoc = { _id: Types.ObjectId; contentType: string; data: Buffer };
export const Image = model('Image', imageSchema);
