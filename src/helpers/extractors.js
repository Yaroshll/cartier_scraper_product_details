// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';
import { gotoWithRetries } from './gotoWithRetries.js';

export async function extractCartierProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    await page.waitForSelector(SELECTORS.PRODUCT_CONTAINER, { timeout: 10000 });

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(handle);

    // Extract title
    const title = await page.$eval(SELECTORS.TITLE, el => el.innerText.trim())
      .catch(() => handle.replace(/_/g, ' '));

    // Extract and clean tags
    const rawTags = await page.$$eval(SELECTORS.BREADCRUMB_ITEMS, items => 
      items.map(item => item.innerText.trim())
    ).catch(() => []);
    
    const tags = rawTags
      .filter(tag => !/home/i.test(tag))
      .map(tag => tag.replace(/[\n\/]/g, '').trim())
      .filter(Boolean)
      .join(',');

    // Extract description
    const description = await getDescription(page);

    // Extract price
    const priceText = await page.$eval(SELECTORS.PRICE, el => el.innerText.trim())
      .catch(() => '0');
    const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

    // Calculate prices
    const { variantPrice, compareAtPrice } = calculatePrices(price);

    // Extract images (skip duplicates)
    const imageUrls = await page.$$eval(SELECTORS.IMAGE_GALLERY_IMAGES, imgs => 
      [...new Set(imgs.map(img => img.src).filter(src => src && !src.includes('placeholder'))]
    ).catch(() => []);

    return {
      Handle: handle,
      Title: title,
      "Body (HTML)": description,
      "Variant SKU": sku,
      "Variant Price": variantPrice,
      "Cost per item": price,
      "Variant Compare At Price": compareAtPrice,
      "Image Src": imageUrls.join(' | '),
      Tags: tags,
      Vendor: "cartier",
      Type: "Jewellery",
      Status: "Active",
      Published: "TRUE",
      "Variant Fulfillment Service": "manual",
      "Variant Inventory Policy": "deny",
      "Variant Inventory Tracker": "shopify"
    };

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  }
}