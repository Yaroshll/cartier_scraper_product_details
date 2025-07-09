// helpers/extractors.js
import { formatHandleFromUrl, extractSKU, calculatePrices } from './formatters.js';
import { getDescription } from './description.js';
import { SELECTORS } from './constants.js';
import { gotoWithRetries } from './gotoWithRetries.js';

export async function extractCartierProductData(page, url) {
  try {
    await gotoWithRetries(page, url);
    console.info("✅ Page loaded, waiting for stability...");
    await page.waitForTimeout(3000);

    const handle = formatHandleFromUrl(url);
    const sku = extractSKU(handle);

    const title = await page.$eval(SELECTORS.TITLE, el => el.innerText.trim())
      .catch(() => handle.replace(/_/g, ' '));

    // Clean breadcrumb tags
    const breadcrumbs = await page.$$eval(
      'div.pdp-main__breadcrumbs ol li a.breadcrumbs__anchor.link--secondary',
      anchors => anchors
        .map(a => a.textContent.trim())
        .filter(text => text && !/home/i.test(text))
        .join(',')
    ).catch(() => '');

    const description = await getDescription(page);

    // Robust price extraction with fallbacks
    const price = await extractPrice(page);
    const { variantPrice, compareAtPrice } = calculatePrices(price);

    // Image extraction
    const imageHandles = await page.$$eval(
      'ul[data-product-component="image-gallery"] li button img',
      imgs => imgs.map(img => img.src).filter(Boolean)
    ).catch(() => []);

    const productRow = {
      Handle: handle,
      Title: title,
      "Body (HTML)": description,
      Vendor: "cartier",
      Type: "Jewellery",
      Tags: breadcrumbs,
      "Variant SKU": sku,
      "Cost per item": price,
      "Variant Price": variantPrice,
      "Variant Compare At Price": compareAtPrice,
      "Image Src": imageHandles[0] || '',
      "Variant Fulfillment Service": "manual",
      "Variant Inventory Policy": "deny",
      "Variant Inventory Tracker": "shopify",
      Status: "Active",
      Published: "TRUE",
      "product.metafields.custom.original_prodect_url": url
    };

    const extraImages = imageHandles.slice(1).map(src => ({
      Handle: handle,
      'Image Src': src
    }));

    return { productRow, extraImages };

  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    throw error;
  }
}

async function extractPrice(page) {
  const extractionMethods = [
    // Method 1: Primary selector with AED removal
    async () => {
      const text = await page.$eval(SELECTORS.PRICE, el => {
        return el.innerText.replace(/AED|[^\d.]/g, '').trim();
      });
      return parseFloat(text) || 0;
    },
    
    // Method 2: Alternative price element
    async () => {
      const text = await page.$eval('.price-value', el => {
        return el.innerText.replace(/[^\d.]/g, '');
      });
      return parseFloat(text) || 0;
    },
    
    // Method 3: Meta tag fallback
    async () => {
      const price = await page.$eval('meta[property="product:price:amount"]', el => 
        parseFloat(el.content)
      );
      return price || 0;
    }
  ];

  for (const method of extractionMethods) {
    try {
      const price = await method();
      if (price > 0) return price;
    } catch (error) {
      continue;
    }
  }
  
  console.warn('All price extraction methods failed, defaulting to 0');
  return 0;
}