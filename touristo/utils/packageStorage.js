const crypto = require('crypto');

const SUPABASE_URL =
  process.env.SUPABASE_URL?.replace(/\/+$/, '');

const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ||
  'touristo-images';

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};


/*
|--------------------------------------------------------------------------
| Validate Storage Configuration
|--------------------------------------------------------------------------
*/

function validateStorageConfig() {
  if (!SUPABASE_URL) {
    throw new Error(
      'SUPABASE_URL environment variable is missing'
    );
  }

  if (!SUPABASE_KEY) {
    throw new Error(
      'SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable is missing'
    );
  }
}


/*
|--------------------------------------------------------------------------
| Common Supabase headers
|--------------------------------------------------------------------------
*/

function storageHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    ...extra
  };
}


/*
|--------------------------------------------------------------------------
| Ensure bucket exists and is public
|--------------------------------------------------------------------------
*/

async function ensureBucket() {

  validateStorageConfig();

  const bucketUrl =
    `${SUPABASE_URL}/storage/v1/bucket/${encodeURIComponent(
      STORAGE_BUCKET
    )}`;

  const checkResponse =
    await fetch(
      bucketUrl,
      {
        method: 'HEAD',
        headers: storageHeaders()
      }
    );

  /*
   * Bucket already exists.
   */
  if (checkResponse.ok) {

    /*
     * Make sure it is public because package images
     * are displayed to travelers without authentication.
     */
    const updateResponse =
      await fetch(
        bucketUrl,
        {
          method: 'PUT',
          headers: storageHeaders({
            'Content-Type':
              'application/json'
          }),
          body: JSON.stringify({
            public: true
          })
        }
      );

    if (
      !updateResponse.ok &&
      updateResponse.status !== 404
    ) {

      const errorText =
        await updateResponse.text();

      throw new Error(
        `Could not configure Supabase Storage bucket: ${errorText}`
      );
    }

    return;
  }


  /*
   * Bucket does not exist.
   * Create it automatically.
   */
  if (checkResponse.status === 404) {

    const createResponse =
      await fetch(
        `${SUPABASE_URL}/storage/v1/bucket`,
        {
          method: 'POST',
          headers: storageHeaders({
            'Content-Type':
              'application/json'
          }),
          body: JSON.stringify({
            id: STORAGE_BUCKET,
            name: STORAGE_BUCKET,
            public: true,
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/webp',
              'image/gif'
            ],
            fileSizeLimit:
              MAX_IMAGE_SIZE
          })
        }
      );

    /*
     * If another request created it at the
     * same time, continue normally.
     */
    if (
      !createResponse.ok &&
      createResponse.status !== 409
    ) {

      const errorText =
        await createResponse.text();

      throw new Error(
        `Could not create Supabase Storage bucket: ${errorText}`
      );
    }

    return;
  }


  const errorText =
    await checkResponse.text();

  throw new Error(
    `Could not access Supabase Storage bucket: ${errorText}`
  );
}


/*
|--------------------------------------------------------------------------
| Upload Package Image
|--------------------------------------------------------------------------
*/

async function uploadPackageImage({
  imageData,
  imageName,
  imageType
}) {

  validateStorageConfig();

  if (
    typeof imageData !== 'string' ||
    !imageData.trim()
  ) {
    throw new Error(
      'No image data was provided'
    );
  }


  /*
   * Only allow actual image MIME types.
   */
  const extension =
    ALLOWED_IMAGE_TYPES[imageType];

  if (!extension) {
    throw new Error(
      'Only JPG, PNG, WEBP and GIF images are allowed'
    );
  }


  /*
   * Accept:
   *
   * data:image/jpeg;base64,....
   *
   * OR
   *
   * plain base64
   */
  let base64Data =
    imageData.trim();

  if (
    base64Data.startsWith(
      'data:'
    )
  ) {

    const match =
      base64Data.match(
        /^data:([^;]+);base64,(.+)$/s
      );

    if (!match) {
      throw new Error(
        'Invalid image data'
      );
    }

    const detectedType =
      match[1];

    if (
      detectedType !== imageType
    ) {
      throw new Error(
        'Image type does not match image data'
      );
    }

    base64Data =
      match[2];
  }


  /*
   * Remove accidental whitespace.
   */
  base64Data =
    base64Data.replace(
      /\s/g,
      ''
    );


  /*
   * Decode image.
   */
  let buffer;

  try {

    buffer =
      Buffer.from(
        base64Data,
        'base64'
      );

  } catch {
    throw new Error(
      'Invalid base64 image data'
    );
  }


  /*
   * Protect the API from huge image payloads.
   */
  if (
    !buffer ||
    buffer.length === 0
  ) {
    throw new Error(
      'Uploaded image is empty'
    );
  }

  if (
    buffer.length >
    MAX_IMAGE_SIZE
  ) {
    throw new Error(
      'Image must be 5 MB or smaller'
    );
  }


  await ensureBucket();


  /*
   * Generate a unique filename.
   *
   * Never trust the original filename as the
   * storage path.
   */
  const safeName =
    typeof imageName === 'string'
      ? imageName
          .replace(
            /[^a-zA-Z0-9._-]/g,
            '-'
          )
          .substring(0, 80)
      : `package.${extension}`;


  const uniqueName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;


  const storagePath =
    `packages/${uniqueName}`;


  /*
   * Upload to Supabase Storage.
   */
  const uploadUrl =
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(
      STORAGE_BUCKET
    )}/${storagePath}`;


  const uploadResponse =
    await fetch(
      uploadUrl,
      {
        method: 'POST',
        headers: storageHeaders({
          'Content-Type':
            imageType,

          'Cache-Control':
            '31536000',

          'x-upsert':
            'false'
        }),
        body: buffer
      }
    );


  if (
    !uploadResponse.ok
  ) {

    const errorText =
      await uploadResponse.text();

    throw new Error(
      `Image upload failed: ${errorText}`
    );
  }


  /*
   * Public URL stored in packages.image.
   */
  const publicUrl =
    `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;


  return {
    url: publicUrl,
    path: storagePath,
    originalName: safeName,
    size: buffer.length,
    type: imageType
  };
}


/*
|--------------------------------------------------------------------------
| Delete Uploaded Object
|--------------------------------------------------------------------------
|
| Used only when DB save fails after successful upload.
|--------------------------------------------------------------------------
*/

async function deletePackageImage(
  storagePath
) {

  if (
    !storagePath ||
    !SUPABASE_URL ||
    !SUPABASE_KEY
  ) {
    return;
  }


  const deleteUrl =
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(
      STORAGE_BUCKET
    )}/${storagePath}`;


  try {

    await fetch(
      deleteUrl,
      {
        method: 'DELETE',
        headers:
          storageHeaders()
      }
    );

  } catch (error) {

    console.error(
      'Could not clean up uploaded image:',
      error.message
    );
  }
}


module.exports = {
  uploadPackageImage,
  deletePackageImage,
  MAX_IMAGE_SIZE,
  STORAGE_BUCKET
};