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
  /**
   * Launch a browser with optimized arguments and Proxy support
   * Supports Kernel.sh for Vercel/Production environments
   */
  public static async launch(): Promise<Browser> {
    const kernelApiKey = env.KERNEL_API_KEY;

    if (kernelApiKey && env.NODE_ENV === 'production') {
      logger.info('Initializing Browser via Kernel.sh (Managed Cloud Browser)...');
      try {
        const kernel = new Kernel({ apiKey: kernelApiKey });
        const kernelBrowser = await kernel.browsers.create();
        
        return await puppeteerCore.connect({
          browserWSEndpoint: kernelBrowser.cdp_ws_url,
        }) as unknown as Browser;
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
      '--disable-blink-features=AutomationControlled', // CRITICAL: Hides automation status
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080',
    ];

    if (proxyUrl) {
      logger.info('Launching Local Browser with Proxy support.');
      args.push(`--proxy-server=${proxyUrl}`);
    }

    const isHeadless = env.BROWSER_HEADLESS;
    const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    // Use puppeteer-extra for local stealth
    return await (puppeteerExtra as any).launch({
      headless: isHeadless,
      args: args,
      defaultViewport: null,
      userAgent: desktopUA, // Set UA at launch for consistency
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

    // Extreme Stealth Hardware Simulation
    await page.evaluateOnNewDocument(() => {
      // 1. Mock Navigator Hardware
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });
      
      // 2. Mock Languages and Platform
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'id'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      
      // 3. Mock WebGL (Detailed GPU)
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) return 'Intel Inc.';
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) return 'Intel(R) UHD Graphics 620';
        return getParameter.apply(this, [parameter]);
      };

      // 4. Hide Automation
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      
      // 5. Mock Permissions
      const originalQuery = window.navigator.permissions.query;
      (window.navigator.permissions as any).query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );
    });

    /* 
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
    */

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );
  }
}
