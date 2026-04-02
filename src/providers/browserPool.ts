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
      '--window-size=1366,768',
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
   * Intercept and block unnecessary resources with Extreme Stealth
   */
  public static async optimizePage(page: Page) {
    // Proxy Auth
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

    // Extreme Stealth Viewport
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    });

    // In-page stealth
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'id'],
      });
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });
      // Mock WebGL
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel(R) Iris(TM) Graphics 6100';
        return getParameter.apply(this, [parameter]);
      };
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );
  }
}
