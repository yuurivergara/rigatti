import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Única coleção com companyId que não usa o tenantPlugin: o login roda antes
 * de existir tenant no contexto — é ele que resolve qual é o tenant.
 */
const userSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'user' },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const User = model('User', userSchema);
