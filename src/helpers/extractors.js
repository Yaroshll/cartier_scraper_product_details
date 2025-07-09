// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';
import { gotoWithRetries } from './gotoWithRetries.js';

export async function extractCartierProductData(page, url) {
  await gotoWithRetries(page, url);
 //await page.goto(url, { waitUntil: 'load' });
   console.info("page loaded, waiting for network idle...");
  await page.waitForTimeout(3000);

  const handle = formatHandleFromUrl(url);
  console.info("handle Done");
  const sku = extractSKU(handle);
  console.info("sku Done");
 const title = await page.$eval('h1.pdp__name', el => el.innerText.trim());

  console.info("title Done");
 // Breadcrumbs
const breadcrumbs = await page.$$eval('div.pdp-main__breadcrumbs ol li', lis =>
  lis.map(li => li.textContent.trim()).filter((_, i) => i > 0).join(',')
);

  const description = await getDescription(page);
  // PRICE (from content attribute)
   // Extract price
  const priceText = await page.textContent(SELECTORS.PRICE).catch(() => '');
  const price = parseFloat(priceText.replace('AED', '').trim().replace(/,/g, ''));
  const { variantPrice, compareAtPrice } = calculatePrices(price);
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
    "Cost per item": price,
    "Image Src": mainImage,
    //"Variant Image": mainImage,
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