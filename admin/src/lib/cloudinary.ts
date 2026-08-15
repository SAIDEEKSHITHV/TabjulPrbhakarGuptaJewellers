export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'thumb' | 'fit' | 'limit';
  quality?: 'auto' | 'low' | 'good' | 'best' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
}

export const CLOUDINARY_CONFIG = {
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  folderPrefix: 'tpg-jewellers/products/'
};

export const CLOUDINARY_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto', format: 'auto' } as CloudinaryTransformOptions,
  card: { width: 600, height: 450, crop: 'fill', quality: 'auto', format: 'auto' } as CloudinaryTransformOptions,
  gallery: { width: 1200, quality: 'auto', format: 'auto' } as CloudinaryTransformOptions,
  hero: { width: 1920, quality: 'auto', format: 'auto' } as CloudinaryTransformOptions,
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

/**
 * Reusable utility to generate optimized and resized Cloudinary URLs.
 * If the publicId is a full external URL, it will fallback gracefully.
 */
export function getCloudinaryImageUrl(publicId: string, options: CloudinaryTransformOptions = {}): string {
  if (!publicId) return '';

  // If the path is a full external URL not hosted on Cloudinary, return as is.
  if (publicId.startsWith('http') && !publicId.includes('cloudinary.com')) {
    return publicId;
  }

  // Parse public ID from full Cloudinary URLs if accidentally provided.
  let cleanPublicId = publicId;
  if (publicId.startsWith('http')) {
    const parts = publicId.split('/image/upload/');
    if (parts.length > 1) {
      // Strip any version identifier like v16234234/ if present
      const pathParts = parts[1].split('/');
      if (pathParts[0].startsWith('v') && !isNaN(Number(pathParts[0].substring(1)))) {
        cleanPublicId = pathParts.slice(1).join('/');
      } else {
        cleanPublicId = parts[1];
      }
    }
  }

  const transforms: string[] = [];

  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }
  
  // Set automatic quality optimization (q_auto) if not explicitly set
  if (options.quality) {
    transforms.push(`q_${options.quality}`);
  } else {
    transforms.push('q_auto');
  }

  // Set automatic format optimization (f_auto) if not explicitly set
  if (options.format) {
    transforms.push(`f_${options.format}`);
  } else {
    transforms.push('f_auto');
  }

  const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${cleanPublicId}`;
}

/**
 * Validates a file for catalog upload rules (format and size checks).
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!CLOUDINARY_CONFIG.allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format. Only JPEG, PNG, and WebP images are allowed.`,
    };
  }

  if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds the 50 MB limit. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads an image file to Cloudinary from the browser using an unsigned upload preset.
 * Enforces a controlled folder structure prefixed with 'tpg-jewellers/products/'.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string
): Promise<{ public_id: string; secure_url: string; delete_token?: string }> {
  // Validate file parameters
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Enforce controlled folder structure
  const allowedPrefix = CLOUDINARY_CONFIG.folderPrefix;
  if (!folder.startsWith(allowedPrefix)) {
    throw new Error(`Security restriction: Folder path must start with '${allowedPrefix}'`);
  }

  // Restrict to safe path characters: alphanumeric, dashes, underscores, and forward slashes.
  const subpath = folder.substring(allowedPrefix.length);
  const pathRegex = /^[\w-]+(\/[\w-]+)*$/;
  if (subpath && !pathRegex.test(subpath)) {
    throw new Error('Security restriction: Folder path contains invalid characters.');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration error: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is missing from environment.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errPayload = await response.json().catch(() => ({}));
    throw new Error(errPayload.error?.message || `Cloudinary upload failed. Status: ${response.status}`);
  }

  const data = await response.json();
  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    delete_token: data.delete_token // Returned for immediate client-side token deletion
  };
}
