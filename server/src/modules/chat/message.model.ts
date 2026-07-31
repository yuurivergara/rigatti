import { Schema, model, type InferSchemaType } from 'mongoose';
import { tenantPlugin } from '../../tenant/plugin.js';

const messageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 20_000 },
  },
  { timestamps: true },
);

messageSchema.plugin(tenantPlugin);
messageSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;
export const Message = model('Message', messageSchema);
