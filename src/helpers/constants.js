// helpers/constants.js

export const BASE_URL = 'https://www.cartier.com';
export const DEFAULT_LOCALE = 'en-ae';
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 2000; // 2 seconds

export const SELECTORS = {
  // Product Identification
  PRODUCT_CONTAINER: 'div.pdp-main',
  
  // Title Elements
  TITLE: 'h1.pdp__name',
  LOGO_TITLE: 'span.font-family--cartier-logos',
  FULL_TITLE: 'h1.pdp__name span.font-family--cartier-logos',
  
  // Navigation/Breadcrumbs
  BREADCRUMBS: 'div.pdp-main__breadcrumbs ol',
  BREADCRUMB_ITEMS: 'div.pdp-main__breadcrumbs ol li:not(:first-child)',
  
  // Pricing Elements
  PRICE: [
    'span.value', // Primary price selector
    '.prices__value', // Alternative selector
    '[data-test="price-value"]', // Test attribute selector
    'span.price', // Generic price class
    'meta[property="product:price:amount"]' // Meta tag
  ].join(','),
  PRICE_CONTAINER: 'div.pdp__price',
  
  // Description Elements
  DESCRIPTION_BUTTON: 'button.pdp-main__description-more',
  DESCRIPTION_CONTENT: 'div.pdp-main__description',
  DESCRIPTION_TRUNCATED: 'span.pdp-main__description-truncated',
  PRODUCT_SPEC: 'p.pdp__product-spec',
  
  // Media/Gallery
  IMAGE_GALLERY: 'ul[data-product-component="image-gallery"]',
  IMAGE_GALLERY_ITEMS: 'ul[data-product-component="image-gallery"] li',
  IMAGE_GALLERY_IMAGES: 'ul[data-product-component="image-gallery"] li img',
  
  // Product Metadata
  JSON_LD: 'script[type="application/ld+json"]',
  PRODUCT_META: 'meta[property^="product:"]',
  
  // Availability
  AVAILABILITY: 'div.pdp__stock-availability',
  ADD_TO_CART: 'button.add-to-cart'
};

export const REGEX = {
  PRICE: /AED?\s*([\d,]+\.?\d*)/i,
  SKU: /[A-Za-z]\d+/,
  URL_HANDLE: /([^\/]+)\.html$/i,
  CURRENCY: /[^0-9.,-]+/g
};

export const ERROR_MESSAGES = {
  PRICE_EXTRACTION: 'Could not extract valid price',
  TITLE_EXTRACTION: 'Could not extract product title',
  IMAGE_EXTRACTION: 'Could not extract product images',
  DESCRIPTION_EXTRACTION: 'Could not extract product description',
  PAGE_LOAD: 'Failed to load product page'
};

// Common selectors for different page variations
export const PAGE_VARIANTS = {
  DEFAULT: {
    ...SELECTORS
  },
  LEGACY: {
    PRICE: 'span.price-value',
    DESCRIPTION: 'div.product-description'
  },
  MOBILE: {
    PRICE: 'div.mobile-price',
    IMAGE_GALLERY: 'div.mobile-gallery'
  }
};