export async function getDescription(page) {
  try {
    const moreBtn = await page.$('button.pdp-main__description-more');
    if (moreBtn) {
      await moreBtn.click();
      await page.waitForSelector('span.pdp-main__description-full', { timeout: 5000 });
      await page.waitForSelector('p.pdp__product-spec', { timeout: 5000 });
    }

    const fullDescHtml = await page.$eval(
      'span.pdp-main__description-full',
      el => el.innerHTML.trim()
    );

    const specDescHtml = await page.$eval(
      'p.pdp__product-spec',
      el => el.outerHTML.trim()
    );

    const description = `${fullDescHtml}\n${specDescHtml}`;
    return description;
  } catch (err) {
    console.warn('⚠️ Could not extract full HTML description:', err.message);
    return '';
  }
}
