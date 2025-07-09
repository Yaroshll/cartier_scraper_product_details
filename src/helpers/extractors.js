// helpers/extractors.js

import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';
import { gotoWithRetries } from './gotoWithRetries.js';

export async function extractCartierProductData(page, url) {
  await gotoWithRetries(page, url);
  console.info("✅ Page loaded, waiting for stability...");
  await page.waitForTimeout(3000);

  const handle = formatHandleFromUrl(url);
  const sku = extractSKU(handle);

  const title = await page.$eval(SELECTORS.TITLE, el => el.innerText.trim());

  // Clean breadcrumb tags and remove empty ones
  const breadcrumbs = await page.$$eval('div.pdp-main__breadcrumbs ol li a.breadcrumbs__anchor.link--secondary', lis =>
    lis
      .map(li => li.textContent.trim())
      .filter(text => text && !/^\/?$/.test(text))
      .slice(1) // skip "Home"
      .join(',')
  );

  const description = await getDescription(page);

   // Extract price
    const priceText = await page.$eval(SELECTORS.PRICE, el => el.innerText.trim())
      .catch(() => '0');
    const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

    // Calculate prices
    const { variantPrice, compareAtPrice } = calculatePrices(price);

  // Extract product images
  const imageHandles = await page.$$eval(
    'ul[data-product-component="image-gallery"] li button img',
    imgs => imgs.map(img => img.src)
  );

  const mainImage = imageHandles[0] || '';
  const extraImages = imageHandles.slice(1).map(src => ({
    Handle: handle,
    'Image Src': src
  }));

  const productRow = {
    Handle: handle,
    Title: title,
    "Body (HTML)": description,
    Vendor: "cartier",
    Type: "Jewellery",
    Tags: breadcrumbs,
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
