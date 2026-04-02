import { BrowserProvider } from '../providers/browserPool';
import { SessionProvider } from '../providers/sessionProvider';
import { ExtractionResult } from '../types';
import logger from '../utils/logger';

export class BrowserExtractor {
  /**
   * Main entry for Layer 4 extraction (Headless Browser)
   * This is slower but highly resilient to bot protection.
   */
  public async extract(url: string): Promise<ExtractionResult> {
    let browser = null;
    try {
      browser = await BrowserProvider.launch();
      const page = await browser.newPage();
      
      // Optimize page load
      await BrowserProvider.optimizePage(page);

      // 1. Navigate with higher timeout and better wait condition
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 40000 });
      } catch (e) {
        logger.warn('Initial navigation timeout/error, retrying with networkidle2...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }

      // Add a small human-like delay and scroll
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
      await page.evaluate(() => window.scrollBy(0, 300));
      await new Promise(r => setTimeout(r, 1000));

      // 2. Capture session
      await SessionProvider.captureFromPage(page);

      // 3. Check for "Unavailable" or "Captcha" state
      const pageStatus = await page.evaluate(() => {
        const text = document.body.innerText;
        if (text.includes('Video currently unavailable') || text.includes('Video ini tidak tersedia')) {
          return 'UNAVAILABLE';
        }
        if (text.includes('Verify to continue') || document.querySelector('#captcha_container')) {
          return 'CAPTCHA';
        }
        return 'OK';
      });

      if (pageStatus !== 'OK') {
        return { success: false, error: `TikTok blocked access with status: ${pageStatus}` };
      }

      // 4. Wait for content
      try {
        await page.waitForSelector('video', { timeout: 15000 });
      } catch (e) {
        logger.warn('Video selector timeout, attempting hydration anyway...');
      }

      // 5. Extract Data
      const extractedData = await page.evaluate(() => {
        const getVal = (obj: any, path: string) => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const universalDataEl = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (universalDataEl && universalDataEl.textContent) {
          try {
            const parsed = JSON.parse(universalDataEl.textContent);
            const detailPath = '__DEFAULT_SCOPE__.webapp.video-detail.itemInfo.itemStruct';
            const item = getVal(parsed, detailPath);
            
            if (item && item.video) {
              return {
                video: item.video.playAddr || item.video.downloadAddr || '',
                cover: item.video.cover || '',
                caption: item.desc || '',
                author: item.author?.uniqueId || item.author?.nickname || ''
              };
            }
          } catch (e) { /* ignore */ }
        }

        const sigi = (window as any)['SIGI_STATE'];
        if (sigi && sigi.ItemModule) {
          const videoId = Object.keys(sigi.ItemModule)[0];
          const item = videoId ? sigi.ItemModule[videoId] : null;
          if (item) {
            return {
              video: item.video?.playAddr || item.video?.downloadAddr || '',
              cover: item.video?.cover || '',
              caption: item.desc || '',
              author: item.author || ''
            };
          }
        }

        const video = document.querySelector('video');
        if (video && video.src && !video.src.startsWith('blob:')) {
          return {
            video: video.src,
            cover: '',
            caption: document.title,
            author: 'Unknown'
          };
        }

        return null;
      });

      if (!extractedData) {
        logger.warn('Browser extraction failed, capturing debug screenshot...');
        await page.screenshot({ path: 'debug-browser-fallback.png', fullPage: true });
        
        const html = await page.content();
        const fs = require('fs');
        fs.writeFileSync('debug-browser-fallback.html', html);

        return { success: false, error: 'Could not extract data via browser automation. See debug files (png/html).' };
      }

      return { success: true, data: extractedData };

    } catch (e: any) {
      logger.error(`Browser Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }
}
