import type { Schema } from 'mongoose';

/**
 * Adds an `id` string virtual, drops `_id`/`__v`, and exposes dates as ISO
 * strings — matching the frontend's `Service`/`GalleryItem`/... types.
 */
export function idTransform(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
    },
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
    },
  });
}
