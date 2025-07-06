import { chromium } from 'playwright';

export async function launchBrowser() {
  const browser = await chromium.launch({ headless: false ,
    channel: "chrome",
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ],
    timeout: 12000,
  });
  return browser;
}
