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
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1366,768',
      '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    ];

    if (proxyUrl) {
      logger.info('Launching Local Browser with Proxy support.');
      args.push(`--proxy-server=${proxyUrl}`);
    }

    const isHeadless = env.BROWSER_HEADLESS;

    // Use puppeteer-extra for local stealth
    return await (puppeteerExtra as any).launch({
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
