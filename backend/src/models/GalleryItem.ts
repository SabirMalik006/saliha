import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

export const GALLERY_CATEGORIES = [
  'clinic',
  'awareness',
  'events',
  'promotional',
] as const;

const gallerySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, default: null, trim: true, maxlength: 300 },
    altText: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: GALLERY_CATEGORIES, default: 'clinic' },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    /** Cloudinary public id, used to delete the asset when the item is removed. */
    imagePublicId: { type: String, default: null, select: false },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

gallerySchema.index({ published: 1, displayOrder: 1 });
gallerySchema.index({ category: 1 });
idTransform(gallerySchema);

export type GalleryItemDoc = InferSchemaType<typeof gallerySchema>;
export const GalleryItem = model('GalleryItem', gallerySchema);
