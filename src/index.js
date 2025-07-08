// index.js
import { launchBrowser } from './helpers/browser.js';
import { extractCartierProductData } from './helpers/extractors.js';
import { saveToCSVAndExcel } from './helpers/fileIO.js';

const urls = [
  'https://www.cartier.com/en-ae/jewellery/bracelets/love-bracelet-medium-model-B6081517.html'
];

(async () => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

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