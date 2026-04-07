import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerCore, { Browser, Page } from 'puppeteer-core';
import puppeteerLocal from 'puppeteer';
import Kernel from '@onkernel/sdk';
import logger from '../utils/logger';
import dotenv from 'dotenv';
import { env } from '../utils/env';

dotenv.config();

// Apply stealth plugin
puppeteerExtra.use(StealthPlugin());
export class BrowserProvider {
  private static browserInstance: Browser | null = null;
  private static launchPromise: Promise<Browser> | null = null;

  /**
   * Launch or Reuse a browser with optimized arguments and Proxy support
   */
  public static async launch(): Promise<Browser> {
    // Return existing instance if it's still alive
    if (this.browserInstance && this.browserInstance.isConnected()) {
        try {
            // Test if we can open a dummy page to ensure process is truly responsive
            const testPage = await this.browserInstance.newPage();
            await testPage.close();
            return this.browserInstance;
        } catch (e) {
            logger.warn('Stored browser instance is unresponsive, launching new one...');
            this.browserInstance = null;
        }
    }

    // Handle concurrent launch requests to avoid multiple browsers
    if (this.launchPromise) return this.launchPromise;

    this.launchPromise = (async () => {
        const kernelApiKey = env.KERNEL_API_KEY;

        if (kernelApiKey && env.NODE_ENV === 'production') {
          logger.info('Initializing Browser via Kernel.sh (Managed Cloud Browser)...');
          try {
            const kernel = new Kernel({ apiKey: kernelApiKey });
            const kernelBrowser = await kernel.browsers.create();
            
            this.browserInstance = await puppeteerCore.connect({
              browserWSEndpoint: kernelBrowser.cdp_ws_url,
            }) as unknown as Browser;
            return this.browserInstance;
          } catch (e: any) {
            logger.error(`Kernel.sh Connection Failed: ${e.message}. Falling back to local...`);
          }
        }

        const proxyUrl = env.PROXY_URL;
        const args = [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,720',
        ];

        if (proxyUrl) {
          logger.info('Launching Local Browser with Proxy support.');
          args.push(`--proxy-server=${proxyUrl}`);
        }

        const isHeadless = env.BROWSER_HEADLESS;
        const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

        this.browserInstance = await (puppeteerExtra as any).launch({
          headless: isHeadless,
          args: args,
          defaultViewport: null,
          userAgent: desktopUA,
        });

        return this.browserInstance!;
    })();

    try {
        const browser = await this.launchPromise;
        this.launchPromise = null;
        return browser;
    } catch (e) {
        this.launchPromise = null;
        throw e;
    }
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

    // Request Interception for Performance
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url().toLowerCase();
      
      // Block non-essential resources to speed up loading
      if (['image', 'font', 'stylesheet', 'media'].includes(resourceType)) {
        // Exception: we might need some scripts, but definitely not images/css for metadata
        req.abort();
      } else if (url.includes('google-analytics') || url.includes('doubleclick') || url.includes('facebook.com')) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Extreme Stealth Viewport
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    });

    // Extreme Stealth Hardware Simulation
    await page.evaluateOnNewDocument(() => {
      // 1. Mock Navigator Hardware
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });
      
      // 2. Mock Languages and Platform
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'id'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      
      // 4. Hide Automation
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
  }
}
