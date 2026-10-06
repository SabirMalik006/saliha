import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env';

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
} else {
  console.warn(
    '[cloudinary] Not configured. Image uploads will fail until CLOUDINARY_* variables are set.',
  );
}

export { cloudinary };

export interface UploadedImage {
  url: string;
  thumbnailUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Uploads an in-memory image buffer to Cloudinary and returns a delivery URL
 * plus a square thumbnail URL generated on the fly by Cloudinary.
 */
export function uploadImageBuffer(
  buffer: Buffer,
  options: { folder?: string; publicId?: string } = {},
): Promise<UploadedImage> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error(
        'Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env',
      ),
    );
  }

  const folder = options.folder ?? env.cloudinary.folder;

  return new Promise<UploadedImage>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        resource_type: 'image',
        overwrite: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed.'));
          return;
        }

        resolve({
          url: result.secure_url,
          thumbnailUrl: cloudinary.url(result.public_id, {
            secure: true,
            transformation: [
              { width: 600, height: 450, crop: 'fill', gravity: 'auto' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          }),
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );

    stream.end(buffer);
  });
}

/** Best-effort delete; a missing asset must never fail the API request. */
export async function destroyImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('[cloudinary] Could not delete asset', publicId, error);
  }
}
