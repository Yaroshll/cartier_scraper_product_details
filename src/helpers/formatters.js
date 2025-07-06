export function formatHandle(url) {
  const slug = url.split('/').pop().replace('.html', '');
  return slug.replace(/-/g, '_');
}

export function extractSKU(handle) {
  return handle.split('_').pop();
}

export function calculatePrices(cost) {
  const variantPrice = (cost * 1.3).toFixed(2);
  const compareAt = (variantPrice * 1.2).toFixed(2);
  return { variantPrice, compareAt };
}
