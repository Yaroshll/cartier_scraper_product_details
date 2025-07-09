import { SELECTORS } from './constants.js';

export async function getDescription(page) {
 let description = '';
try {
  const moreBtn = await page.$('button.pdp-main__description-more');
  if (moreBtn) {
    await moreBtn.click();
    await page.waitForSelector('span.pdp-main__description-full', { timeout: 5000 });
  }

  // Get the full visible description including text inside <span>
  const fullDescription = await page.$eval(
    'span.pdp-main__description-full',
    el => el.innerText.trim()
  );

  // Optionally add product-spec text (under paragraph)
  const specText = await page.$eval(
    'p.pdp__product-spec',
    el => el.innerText.trim()
  ).catch(() => '');

  // Combine both
  description = `${fullDescription}\n\n${specText}`;
  return description;
} catch (err) {
  console.warn('⚠️ Description extraction failed:', err.message);
}
}