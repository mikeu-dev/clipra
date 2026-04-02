import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

// Apply stealth plugin
puppeteer.use(StealthPlugin());

export class BrowserProvider {
  /**
   * Launch a browser with optimized arguments and Proxy support
   */
  public static async launch(): Promise<Browser> {
    const proxyUrl = process.env.PROXY_URL;
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1280,720',
    ];

    if (proxyUrl) {
      logger.info('Launching Browser with Proxy support.');
      args.push(`--proxy-server=${proxyUrl}`);
    }

    const isHeadless = process.env.BROWSER_HEADLESS !== 'false';

    return await puppeteer.launch({
      headless: isHeadless,
      args: args,
    });
  }

  /**
   * Intercept and block unnecessary resources
   */
  public static async optimizePage(page: Page) {
    // If Proxy has authentication, handles it
    const proxyUrl = process.env.PROXY_URL;
    if (proxyUrl && proxyUrl.includes('@')) {
      try {
        const authPart = proxyUrl.split('//')[1].split('@')[0];
        const [username, password] = authPart.split(':');
        if (username && password) {
          await page.authenticate({ username, password });
        }
      } catch (e) {
        logger.warn('Failed to parse proxy authentication credentials');
      }
    }

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    );
  }
}
