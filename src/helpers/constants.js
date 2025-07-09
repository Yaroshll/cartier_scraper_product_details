// helpers/constants.js

export const SELECTORS = {
  PRODUCT_CONTAINER: 'div.pdp-main',
  TITLE: 'h1.pdp__name',
  BREADCRUMB_ITEMS: 'div.pdp-main__breadcrumbs ol li:not(:first-child)',
  PRICE: 'span.value',
  DESCRIPTION_BUTTON: 'button.pdp-main__description-more',
  DESCRIPTION_CONTENT: 'div.pdp-main__description',
  IMAGE_GALLERY_IMAGES: 'ul[data-product-component="image-gallery"] li img'
};

export const DEFAULT_VALUES = {
  VENDOR: "cartier",
  TYPE: "Jewellery",
  STATUS: "Active",
  PUBLISHED: "TRUE",
  FULFILLMENT_SERVICE: "manual",
  INVENTORY_POLICY: "deny",
  INVENTORY_TRACKER: "shopify"
};