// helpers/formatters.js

export function formatHandleFromUrl(url) {
  const cleanUrl = url.split('?')[0]; // Remove query params
  const parts = cleanUrl.split('/');
  const lastPart = parts[parts.length - 1].replace('.html', '');
  return lastPart.replace(/-/g, '_');
}

export function extractSKU(handle) {
  const parts = handle.split('_');
  return parts[parts.length - 1];
}

export function calculatePrices(cost) {
  const variantPrice = parseFloat((cost * 1.3).toFixed(2));
  const compareAtPrice = parseFloat((variantPrice * 1.2).toFixed(2));
  return { variantPrice, compareAtPrice };
}