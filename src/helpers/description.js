import { SELECTORS } from './constants.js';

export async function getDescription(page) {
  let description = '';
  try {
    // Click the "Read More" button if available
    const moreBtn = await page.$(SELECTORS.DESCRIPTION_BUTTON);
    if (moreBtn) {
      await moreBtn.click();
      await page.waitForSelector('span.pdp-main__description-full', { timeout: 5000 });
      await page.waitForSelector('p.pdp__product-spec', { timeout: 5000 });
    }

    // Grab full HTML description
    const fullDescHTML = await page.$eval(
      'span.pdp-main__description-full',
      el => el.innerHTML.trim()
    ).catch(() => '');

    // Append spec note (keep <p> tag)
    const specNote = await page.$eval(
      'p.pdp__product-spec',
      el => el.outerHTML.trim()
    ).catch(() => '');

    description = `${fullDescHTML}${specNote}`;
  } catch (err) {
    console.warn('⚠️ Could not extract full HTML description:', err.message);
  }

  return description;
}
