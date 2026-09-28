/*
|--------------------------------------------------------------------------
| Package Image Library
|--------------------------------------------------------------------------
|
| These images are assigned to the current package IDs visible in the
| packages table.
|
| Package IDs 1-9:
|
| 1  Hunza Cultural Heritage Tour
| 2  Skardu Mountain Adventure
| 3  Hunza Luxury Experience
| 4  Swat Valley Trekking Adventure
| 5  Gwadar Coastal Adventure
| 6  Skardu Mountain Expedition
| 7  Lahore Historical Tour
| 8  Mohenjo-daro Archaeological Tour
| 9  Naran Kaghan Scenic Tour
|
|--------------------------------------------------------------------------
*/

const PACKAGE_IMAGE_OVERRIDES = {
  /*
   * 1 — Hunza Cultural Heritage Tour
   */
  1:
    'https://images.unsplash.com/photo-1514558427911-8e293bebf18c?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 2 — Skardu Mountain Adventure
   */
  2:
    'https://images.unsplash.com/photo-1708350579415-cf524f3504ad?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 3 — Hunza Luxury Experience
   */
  3:
    'https://images.unsplash.com/photo-1683548632549-8fa44ce4f10e?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 4 — Swat Valley Trekking Adventure
   */
  4:
    'https://images.unsplash.com/photo-1724142923909-fc4b0c3a2a32?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 5 — Gwadar Coastal Adventure
   */
  5:
    'https://images.unsplash.com/photo-1698736277820-7eb872a1d751?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 6 — Skardu Mountain Expedition
   */
  6:
    'https://images.unsplash.com/photo-1702895095207-397632b3ab97?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 7 — Lahore Historical Tour
   */
  7:
    'https://images.unsplash.com/photo-1722953035460-d61752458d8b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 8 — Mohenjo-daro Archaeological Tour
   */
  8:
    'https://images.unsplash.com/photo-1608717310359-3a1e90a53504?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600',

  /*
   * 9 — Naran Kaghan Scenic Tour
   */
  9:
    'https://images.unsplash.com/photo-1660659652868-14957fad6a17?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.1.0&q=85&w=1600'
};


/*
|--------------------------------------------------------------------------
| Resolve Package Image
|--------------------------------------------------------------------------
|
| For the existing packages 1-9, use the corrected curated image.
|
| For any future package that does not have an override, keep using the
| image saved in the database.
|
|--------------------------------------------------------------------------
*/

function getPackageImage(packageId, storedImage) {
  const id = Number(packageId);

  if (
    Number.isInteger(id) &&
    PACKAGE_IMAGE_OVERRIDES[id]
  ) {
    return PACKAGE_IMAGE_OVERRIDES[id];
  }

  return storedImage || null;
}


module.exports = {
  PACKAGE_IMAGE_OVERRIDES,
  getPackageImage
};