import { SELECTORS } from './constants.js';

export async function getDescription(page) {
  let description = '';
  try {
    const moreBtn = await page.$(SELECTORS.DESCRIPTION_BUTTON);
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
  return description;
}


// helpers/fileIO.js
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export function saveToCSVAndExcel(productRow, extraImages) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const fileName = `cartier_products_${timestamp}`;
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const fullRows = [productRow, ...extraImages];
  const ws = xlsx.utils.json_to_sheet(fullRows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Products');

  const csvPath = path.join(outputDir, `${fileName}.csv`);
  const excelPath = path.join(outputDir, `${fileName}.xlsx`);

  xlsx.writeFile(wb, csvPath, { bookType: 'csv' });
  xlsx.writeFile(wb, excelPath);
}