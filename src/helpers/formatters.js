// helpers/formatters.js

export function formatHandleFromUrl(url) {
  const part = url.split('/').pop().replace('.html', '');
  return part.replace(/-/g, '_');
}

export function extractSKU(handle) {
  const parts = handle.split('_');
  return parts[parts.length - 1];
}

export function calculatePrices(cost) {
  const variantPrice = +(cost * 1.3).toFixed(2);
  const compareAtPrice = +(variantPrice * 1.2).toFixed(2);
  return { variantPrice, compareAtPrice };
}
