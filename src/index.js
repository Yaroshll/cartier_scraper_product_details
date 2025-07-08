// index.js
import { launchBrowser } from './helpers/browser.js';
import { extractCartierProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';

const urls = [
  'https://www.cartier.com/en-ae/jewellery/bracelets/love-bracelet-medium-model-B6081517.html'
];

(async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 }
});
const page = await context.newPage();


  for (const url of urls) {
    try {
      const { productRow, extraImages } = await extractCartierProductData(page, url);
      saveToCSVAndExcel(productRow, extraImages);
      console.log(`✅ Scraped and saved: ${url}`);
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err);
    }
  }

  await browser.close();
})();