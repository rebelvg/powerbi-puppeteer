import puppeteer from 'puppeteer-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';
import { CONFIG } from './config';

process.on('unhandledRejection', (error) => {
  throw error;
});

puppeteer.use(puppeteerStealth());

async function createPage(url: string) {
  const browser = await puppeteer.launch({
    headless: false,
  } as any);
  const page = await browser.newPage();

  page.setViewport({ width: 1280, height: 720 });

  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: 'networkidle0' });

  return { page };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const url = 'https://powerbi.microsoft.com/en-us/';

  const { page } = await createPage(url);

  const [signInButton] = await page.$x("//a[contains(., 'Sign in')]");

  await signInButton.evaluate((e) => e.click());

  await page.screenshot({ path: 'screenshot_1.png' });

  await page.waitForSelector('i0116');
  await page.keyboard.type(CONFIG.username);
  await page.keyboard.press('Enter');

  await page.waitForSelector('i0118');
  await page.keyboard.type(CONFIG.password);
  await page.keyboard.press('Enter');

  const [loginButton] = await page.$x('idSIButton9');

  await loginButton.evaluate((e) => e.click());

  (await page.$x(`.workspacesPaneExpander > .typeIcon`))[0].click();

  (await page.$x(`.search > input`))[0].click();

  await page.$eval('.search > input', (el) => (el.nodeValue = 'Procurement'));

  (await page.$x(`.updateBtn`))[0].click();

  (await page.$x(`.workspacesPaneExpander > .typeIcon`))[0].click();
  (await page.$x(`.workspacesPaneExpander > .typeIcon`))[0].click();
  (await page.$x(`.workspacesPaneExpander > .typeIcon`))[0].click();
})();
