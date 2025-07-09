// helpers/formatters.js

/**
 * Formats URL into handle (last part of URL without .html and hyphens replaced with underscores)
 * @param {string} url - Product URL
 * @returns {string} Formatted handle
 */
export function formatHandleFromUrl(url) {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }
    
    const cleanUrl = url.split('?')[0]; // Remove query parameters
    const parts = cleanUrl.split('/').filter(part => part && !part.startsWith('en-'));
    const lastPart = parts.pop() || '';
    const withoutExtension = lastPart.replace(/\.html$/i, '');
    return withoutExtension.replace(/-/g, '_').toLowerCase();
  } catch (error) {
    console.error('Error formatting handle from URL:', error);
    return 'unknown_product';
  }
}

/**
 * Extracts SKU from handle (last segment after underscores)
 * @param {string} handle - Formatted handle
 * @returns {string} Extracted SKU
 */
export function extractSKU(handle) {
  try {
    if (!handle || typeof handle !== 'string') {
      throw new Error('Invalid handle provided');
    }
    
    const parts = handle.split('_');
    const lastPart = parts[parts.length - 1];
    
    // Validate SKU format (typically starts with letter followed by numbers)
    if (/^[A-Za-z]\d+$/.test(lastPart)) {
      return lastPart.toUpperCase();
    }
    return lastPart;
  } catch (error) {
    console.error('Error extracting SKU:', error);
    return 'UNKNOWN_SKU';
  }
}

/**
 * Calculates variant prices based on cost
 * @param {number} cost - Base cost
 * @returns {Object} Calculated prices
 */
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

/**
 * Formats currency string to number
 * @param {string} priceText - Price text (e.g. "AED 1,250.00")
 * @returns {number} Parsed price
 */
export function parsePriceText(priceText) {
  try {
    if (!priceText) return 0;
    
    // Match numbers with possible commas and decimals
    const match = priceText.match(/(\d[\d,]*\.?\d*)/);
    if (!match) return 0;
    
    return parseFloat(match[0].replace(/,/g, ''));
  } catch (error) {
    console.error('Error parsing price text:', error);
    return 0;
  }
}