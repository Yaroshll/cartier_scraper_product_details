import { chromium } from 'playwright';
import { formatHandle, extractSKU, calculatePrices } from './formatters.js';

/**
 * Robust navigation with retry logic
 */
async function navigateWithRetry(page, url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Navigation attempt ${attempt}/${maxRetries} to ${url}`);
      
      // Clear cookies and cache between attempts
      if (attempt > 1) {
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
      }
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000,
        referer: 'https://www.google.com/'
      });
      
      // Check if we got blocked
      if (await page.$('div#blocked-page, div#captcha')) {
        throw new Error('Blocked by bot detection');
      }
      
      return; // Success
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt >= maxRetries) {
        throw new Error(`Navigation failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Random delay before retry (5-15 seconds)
      await page.waitForTimeout(5000 + Math.random() * 10000);
    }
  }
}

/**
 * Waits for critical product page elements
 */
async function waitForProductData(page) {
  // Initial delay to allow page to settle
  await page.waitForTimeout(2000);
  
  // Check for blocking
  const blocker = await page.$('div#blocked-page, div#captcha');
  if (blocker) {
    throw new Error('Page blocked by bot protection');
  }

  // Wait for either product data or error page
  await Promise.race([
    // Product elements we expect
    Promise.all([
      page.waitForSelector('h1.pdp__name', { timeout: 30000 }),
      page.waitForSelector('span.value', { timeout: 30000 }),
      page.waitForSelector('ul[data-product-component="image-gallery"]', { timeout: 30000 })
    ]),
    
    // Error conditions
    page.waitForSelector('div.error-page, div.page-not-found', { timeout: 30000 })
      .then(() => { throw new Error('Page not found'); })
  ]);

  // Additional verification
  const hasProductData = await page.evaluate(() => {
    return !!document.querySelector('h1.pdp__name') && 
           !!document.querySelector('span.value');
  });
  
  if (!hasProductData) {
    throw new Error('Page loaded but missing product data');
  }
}

/**
 * Main extraction function
 */
export async function extractCartierData(page, url) {
  // Configure page settings
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });
  await page.setViewportSize({ width: 1280, height: 800 });

  // Human-like behavior simulation
  await page.mouse.move(Math.random() * 500, Math.random() * 500);
  await page.waitForTimeout(1000 + Math.random() * 2000);

  try {
    // Navigation with retries
    await navigateWithRetry(page, url);
    
    // Wait for critical elements
    await waitForProductData(page);

    // Extract handle (from URL)
    const handle = formatHandle(url);
    const sku = extractSKU(handle);

    // Extract title
    const title = await page.textContent('h1.pdp__name').catch(() => '');

    // Extract tags
    const tagItems = await page.$$eval(
      'div.pdp-main__breadcrumbs ol li:not(:first-child)',
      lis => lis.map(li => li.textContent.trim()).filter(Boolean).join(', ')
    ).catch(() => '');


      // Get both description parts
    let description = '';
    try {
      const moreBtn = await page.$('button.pdp-main__description-more');
      if (moreBtn) {
        await moreBtn.click();
        await page.waitForSelector('span.pdp-main__description-truncated', { timeout: 5000 });
        await page.waitForSelector('p.pdp__product-spec', { timeout: 5000 });
      }

      const truncDesc = await page.textContent('span.pdp-main__description-truncated').catch(() => '');
      const specDesc = await page.textContent('p.pdp__product-spec').catch(() => '');
      description = `${truncDesc}\n${specDesc}`.trim();
    } catch {
      console.warn('Could not extract full description');
    }
    // Extract price
    const rawPrice = await page.textContent('span.value').catch(() => '0');
    const cost = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;
    const { variantPrice, compareAt } = calculatePrices(cost);

    // Extract images - FIRST IMAGE ONLY for main data
     let mainImage = '';
    let additionalImages = [];
    try {
      const images = await page.$$eval(
        'ul[data-product-component="image-gallery"] li img',
        imgs => imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean)
      );
      [mainImage, ...additionalImages] = images;
    } catch {
      console.warn('Image extraction failed');
    }
      

    // Main product data (first row)
    const mainProduct = {
      Handle: handle,
      Title: title,
      BodyHTML: description,
      VariantSKU: sku,
      VariantPrice: variantPrice,
      CompareAtPrice: compareAt,
      CostPerItem: cost,
      ImageSrc: mainImage,
      Tags: tagItems,
      originalURL: url
    };

    // Additional images (only handle and ImageSrc)
    const additionalImageRows = additionalImages.map(src => ({
      Handle: handle,
      ImageSrc: src
    }));

    return [mainProduct, ...additionalImageRows];
    
  } catch (error) {
    console.error(`Extraction failed for ${url}:`, error);
    throw error;
  }
}

/**
 * Creates a new browser instance with anti-bot settings
 */
export async function createBrowser() {
  return await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
}