/*
|--------------------------------------------------------------------------
| Seeded Package Image Library
|--------------------------------------------------------------------------
|
| Single source of truth for the images attached to the demo packages that
| seedData.js creates. Keyed by package title so the same value is reused
| by:
|
|   - touristo/utils/seedData.js           (fresh seeds)
|   - scripts/backfill-package-images.js  (existing databases)
|   - touristo/models/Package.js          (read-time safety net)
|
| Every URL is a Pexels CDN link (hotlink friendly, no API key required)
| and was verified to return HTTP 200.
|--------------------------------------------------------------------------
*/

const PACKAGE_IMAGES = {
  'Hunza Cultural Heritage Tour':
    'https://images.pexels.com/photos/35302565/pexels-photo-35302565.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Skardu Mountain Adventure':
    'https://images.pexels.com/photos/33784883/pexels-photo-33784883.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Hunza Luxury Experience':
    'https://images.pexels.com/photos/30355168/pexels-photo-30355168.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Swat Valley Trekking Adventure':
    'https://images.pexels.com/photos/37385405/pexels-photo-37385405.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Gwadar Coastal Adventure':
    'https://images.pexels.com/photos/12180798/pexels-photo-12180798.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Skardu Mountain Expedition':
    'https://images.pexels.com/photos/33837898/pexels-photo-33837898.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Lahore Historical Tour':
    'https://images.pexels.com/photos/6255712/pexels-photo-6255712.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Mohenjo-daro Archaeological Tour':
    'https://images.pexels.com/photos/25548851/pexels-photo-25548851.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Naran Kaghan Scenic Tour':
    'https://images.pexels.com/photos/32889687/pexels-photo-32889687.jpeg?auto=compress&cs=tinysrgb&w=1280',

  'Babusar Top Adventure':
    'https://images.pexels.com/photos/38667203/pexels-photo-38667203.jpeg?auto=compress&cs=tinysrgb&w=1280'
};


/*
|--------------------------------------------------------------------------
| Legacy images
|--------------------------------------------------------------------------
|
| The first seed shipped a handful of Unsplash photos that were either
| duplicated across packages or dead (404). A stored image that still points
| at one of these ids is treated as "not custom" and safe to replace.
|--------------------------------------------------------------------------
*/

const LEGACY_PACKAGE_IMAGE_IDS = [
  '1506905925346-21bda4d32df4',
  '1547471080-7cc2caa01a7e',
  '1551632811-561732d1e306',
  '1507525428034-b723cf961d3e',
  '1464822759023-fed622ff2c3b',
  '1584285417130-12d00386b4fa'
];

function isLegacyPackageImage(image) {
  if (typeof image !== 'string' || image.trim() === '') {
    return true;
  }

  return LEGACY_PACKAGE_IMAGE_IDS.some(id => image.includes(id));
}


/*
|--------------------------------------------------------------------------
| Resolve package image
|--------------------------------------------------------------------------
|
| A host-uploaded / custom image ALWAYS wins. Only missing or known-legacy
| images are swapped for the curated seeded image of that package.
|--------------------------------------------------------------------------
*/

function resolveSeededPackageImage(title, storedImage) {
  if (isLegacyPackageImage(storedImage)) {
    return PACKAGE_IMAGES[title] || storedImage || null;
  }

  return storedImage;
}

function getSeededPackageImage(title) {
  return PACKAGE_IMAGES[title] || null;
}


module.exports = {
  PACKAGE_IMAGES,
  LEGACY_PACKAGE_IMAGE_IDS,
  isLegacyPackageImage,
  resolveSeededPackageImage,
  getSeededPackageImage
};
