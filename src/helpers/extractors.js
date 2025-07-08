// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';

export async function extractCartierProductData(page, url) {
 await page.goto(url, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle');

  const handle = formatHandleFromUrl(url);
  const sku = extractSKU(handle);

  const titlePart1 = await page.textContent(SELECTORS.LOGO_TITLE).catch(() => '');
  const titlePart2 = await page.textContent(SELECTORS.TITLE).catch(() => '');
  const title = `${titlePart1} , ${titlePart2}`.trim();

  const breadcrumbs = await page.$$eval(
    `${SELECTORS.BREADCRUMBS} li`,
    lis => lis.map(li => li.textContent.trim()).filter((_, i) => i > 0).join(', ')
  );

  const description = await getDescription(page);

  const priceText = await page.textContent(SELECTORS.PRICE);
  const cost = parseFloat(priceText.replace('AED', '').trim());
  const { variantPrice, compareAtPrice } = calculatePrices(cost);

  const imageHandles = await page.$$eval(
    'ul[data-product-component="image-gallery"] li img',
    imgs => imgs.map(img => img.src)
  );
  const mainImage = imageHandles[0] || '';
  const extraImages = imageHandles.slice(1).map(src => ({ Handle: handle, 'Image Src': src }));

  const productRow = {
    Handle: handle,
    Title: title,
    "Body (HTML)": description,
    Vendor: "cartier",
    Type: "Jewellery",
    Tags: breadcrumbs,
    "Variant SKU": sku,
    "Variant Price": variantPrice,
    "Cost per item": cost,
    "Image Src": mainImage,
    "Variant Image": mainImage,
    "Variant Fulfillment Service": "manual",
    "Variant Inventory Policy": "deny",
    "Variant Inventory Tracker": "shopify",
    Status: "Active",
    Published: "TRUE",
    "Variant Compare At Price": compareAtPrice,
    "product.metafields.custom.original_prodect_url": url
  };

  return { productRow, extraImages };
}