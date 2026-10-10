/*
 * Client-side image compression via canvas.
 * Downsizes oversized photos and re-encodes to JPEG/WebP
 * before they are sent to the server as base64.
 */

const DEFAULTS = {
  avatar: { maxWidth: 512, maxHeight: 512, quality: 0.85 },
  branding: { maxWidth: 1600, maxHeight: 900, quality: 0.82 },
  package: { maxWidth: 1600, maxHeight: 1200, quality: 0.82 }
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the selected image.'));
    };

    img.src = url;
  });
}

export async function compressImage(file, options = {}) {
  const { maxWidth, maxHeight, quality } = {
    ...DEFAULTS.package,
    ...options
  };

  if (!file || !file.type?.startsWith('image/')) {
    return file;
  }

  // GIFs lose animation when re-encoded — leave them alone.
  if (file.type === 'image/gif') {
    return file;
  }

  const img = await loadImage(file);

  let { naturalWidth: width, naturalHeight: height } = img;

  if (width <= 0 || height <= 0) {
    return file;
  }

  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  // Already small enough and not a heavy PNG — skip work.
  if (scale === 1 && file.size <= 300 * 1024) {
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, outputType, quality)
  );

  if (!blob || blob.size >= file.size) {
    // Compression did not help — keep the original.
    return file;
  }

  const name = file.name?.replace(/\.\w+$/, '') || 'image';
  const ext = outputType === 'image/png' ? 'png' : 'jpg';

  return new File([blob], `${name}.${ext}`, { type: outputType });
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error('Could not read the selected image.'));

    reader.readAsDataURL(file);
  });
}

export const IMAGE_PRESETS = DEFAULTS;
