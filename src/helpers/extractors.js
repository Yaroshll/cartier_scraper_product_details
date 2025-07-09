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

    // Extract title with fallback
    const title = await page.$eval(SELECTORS.TITLE, el => el.innerText.trim()).catch(() => {
      console.warn('Could not find main title, using handle as fallback');
      return handle.replace(/_/g, ' ');
    });

    // Extract breadcrumbs with improved filtering
    const breadcrumbs = await page.$$eval('div.pdp-main__breadcrumbs ol li', lis =>
      lis
        .map(li => li.textContent.trim())
        .filter(text => text && !/^(home|\/|cartier)$/i.test(text))
        .join(',')
    ).catch(() => '');

    const description = await getDescription(page);

    // Enhanced price extraction with multiple fallbacks
    const price = await extractPrice(page).catch(async (error) => {
      console.error('Price extraction failed:', error);
      // Final fallback - check entire page content
      const pageContent = await page.content();
      const priceMatch = pageContent.match(/AED\s*([\d,]+\.?\d*)/i);
      if (priceMatch) {
        return parseFloat(priceMatch[1].replace(/,/g, ''));
      }
      throw new Error('Could not extract price from any source');
    });

    const { variantPrice, compareAtPrice } = calculatePrices(price);

    // Extract product images with error handling
    const imageHandles = await page.$$eval(
      'ul[data-product-component="image-gallery"] li img',
      imgs => imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean)
    ).catch(() => []);

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

  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    throw error;
  }
}

async function extractPrice(page) {
  // Try multiple price extraction methods
  const extractionMethods = [
    // Method 1: Primary selector
    async () => {
      const priceText = await page.$eval(SELECTORS.PRICE, el => el.innerText.trim());
      const priceValue = priceText.replace(/AED|,/gi, '').trim();
      return parseFloat(priceValue);
    },
    
    // Method 2: Alternative selectors
    async () => {
      const priceText = await page.$eval('.prices__value, [data-test="price-value"]', el => el.innerText.trim());
      return parseFloat(priceText.replace(/[^\d.]/g, ''));
    },
    
    // Method 3: JSON-LD data
    async () => {
      const jsonLd = await page.$eval('script[type="application/ld+json"]', el => el.textContent);
      const productData = JSON.parse(jsonLd);
      return productData.offers?.price;
    },
    
    // Method 4: Meta tags
    async () => {
      const metaPrice = await page.$eval('meta[property="product:price:amount"]', el => el.content);
      return parseFloat(metaPrice);
    }
  ];

  for (const method of extractionMethods) {
    try {
      const price = await method();
      if (price && !isNaN(price)) {
        return price;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error('All price extraction methods failed');
}