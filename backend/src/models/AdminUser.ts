import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

export const USER_ROLES = ['admin', 'editor'] as const;

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** bcrypt hash — excluded from queries unless explicitly selected. */
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'admin' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

idTransform(adminUserSchema);

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = model('AdminUser', adminUserSchema);
