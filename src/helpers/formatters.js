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
  try {
    if (typeof cost !== 'number' || isNaN(cost)) {
      throw new Error('Invalid cost provided');
    }
    
    const variantPrice = parseFloat((cost * 1.3).toFixed(2));
    const compareAtPrice = parseFloat((variantPrice * 1.2).toFixed(2));
    
    return { 
      variantPrice,
      compareAtPrice,
      cost // Return original for reference
    };
  } catch (error) {
    console.error('Error calculating prices:', error);
    return {
      variantPrice: 0,
      compareAtPrice: 0,
      cost: 0
    };
  }
}
