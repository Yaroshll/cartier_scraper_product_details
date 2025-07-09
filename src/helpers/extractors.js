// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';
import { gotoWithRetries } from './gotoWithRetries.js';

export async function extractCartierProductData(page, url) {
  await gotoWithRetries(page, url);
  console.info("✅ Page loaded, waiting 3s for stability...");
  await page.waitForTimeout(3000);

  const handle = formatHandleFromUrl(url);
  const sku = extractSKU(handle);

  const title = await page.$eval(SELECTORS.TITLE, el => el.innerText.trim());

  const breadcrumbs = await page.$$eval(
    'div.pdp-main__breadcrumbs ol li',
    lis => lis.map(li => li.textContent.trim()).filter((_, i) => i > 0).join(',')
  );

  const cleanedTags = breadcrumbs
    .split(',')
    .map(tag => tag.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(',');

  const description = await getDescription(page);

  // Price via content attribute
  const priceContent = await page.$eval(SELECTORS.PRICE, el => el.getAttribute('content')).catch(() => null);
  const price = parseFloat(priceContent);

  if (!price || isNaN(price)) throw new Error(`❌ Invalid price found: ${priceContent}`);

  const { variantPrice, compareAtPrice } = calculatePrices(price);

  const imageHandles = await page.$$eval(
    SELECTORS.IMAGE_GALLERY,
    imgs => imgs.map(img => img.src).filter(src => !src.includes('cartier.com/en-ae'))
  );

  const mainImage = imageHandles[0] || '';
  const extraImages = imageHandles.slice(1).map(src => ({ Handle: handle, 'Image Src': src }));

  const productRow = {
    Handle: handle,
    Title: title,
    "Body (HTML)": description,
    Vendor: "cartier",
    Type: "Jewellery",
    Tags: cleanedTags,
    "Variant SKU": sku,
    "Variant Price": variantPrice,
    "Cost per item": price,
    "Image Src": mainImage,
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
