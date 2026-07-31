import { Schema, model, type InferSchemaType, type Types } from 'mongoose';
import { tenantPlugin } from '../../tenant/plugin.js';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 80, index: true },
    // A primeira imagem é a capa usada na listagem.
    images: {
      type: [String],
      default: [],
      validate: [(value: string[]) => value.length <= 8, 'Máximo de 8 imagens por produto'],
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

productSchema.plugin(tenantPlugin);

productSchema.index({ companyId: 1, category: 1, price: 1 });
productSchema.index({ companyId: 1, createdAt: -1 });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: Types.ObjectId };
export const Product = model('Product', productSchema);
