import { launchBrowser } from './helpers/browser.js';
import { extractCartierData } from './helpers/extractors.js';
import { saveDataAsCSVAndExcel } from './helpers/fileIO.js';

const urls = [
  'https://www.cartier.com/en-ae/jewellery/rings/juste-un-clou-ring-small-model-CRB4225900.html',
  'https://www.cartier.com/en-ae/jewellery/rings/juste-un-clou-ring-small-model-CRB4225900.html'
];

const allProducts = [];

const browser = await launchBrowser();
const context = await browser.newContext();
const page = await context.newPage();

for (const url of urls) {
  try {
    const productRows = await extractCartierData(page, url);
    allProducts.push(...productRows);
  } catch (err) {
    console.error(`Error scraping ${url}:`, err);
  }
}

await browser.close();
if (allProducts.length > 0) {
  saveDataAsCSVAndExcel(allProducts);
} else {
  console.warn('No products were scraped. Skipping file save.');
}