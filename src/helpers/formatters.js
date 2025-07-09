// helpers/formatters.js

/**
 * Generates a handle (Shopify-friendly name) from a product URL.
 * @param {string} url
 * @returns {string} handle
 */
export function formatHandleFromUrl(url) {
  const part = url.split('/').pop().replace('.html', '');
  return part.replace(/-/g, '_');
}

/**
 * Extracts the SKU from a handle (last part after last underscore).
 * @param {string} handle
 * @returns {string} sku
 */
export function extractSKU(handle) {
  const parts = handle.split('_');
  return parts[parts.length - 1];
}

/**
 * Calculates Shopify-style prices.
 * @param {number} cost
 * @returns {{variantPrice: number, compareAtPrice: number}}
 */
// export function calculatePrices(cost) {
//   const variantPrice = +(cost * 1.3).toFixed(2);
//   const compareAtPrice = +(variantPrice * 1.2).toFixed(2);
//   return { variantPrice, compareAtPrice };
// }
