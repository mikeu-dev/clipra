import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import logger from '../utils/logger';

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export class BrowserProvider {
  /**
   * Launch a browser with optimized arguments
   */
  public static async launch(): Promise<Browser> {
    logger.info('Launching Puppeteer Browser Instance...');
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1280,720',
      ],
    });
  }

  /**
   * Intercept and block unnecessary resources to speed up page loading
   */
  public static async optimizePage(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Block images, stylesheets, fonts, and media
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Mask user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    );
  }
}
