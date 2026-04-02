import { BrowserProvider } from '../providers/browserPool';
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

      // Navigate
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Run JS payload in browser context to extract hydration data directly from window
      const extractedData = await page.evaluate(() => {
        // Option 1: SIGI_STATE
        const sigiState = (window as any)['SIGI_STATE'];
        if (sigiState && sigiState.ItemModule) {
          const videoId = Object.keys(sigiState.ItemModule)[0];
          if (videoId) {
            const item = sigiState.ItemModule[videoId];
            return {
              video: item.video?.playAddr || item.video?.downloadAddr || '',
              cover: item.video?.cover || '',
              caption: item.desc || '',
              author: item.author || ''
            };
          }
        }

        // Option 2: UNIVERSAL_DATA
        const universalDataEl = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (universalDataEl && universalDataEl.textContent) {
          try {
            const parsed = JSON.parse(universalDataEl.textContent);
            const defaultScope = parsed['__DEFAULT_SCOPE__'] || parsed;
            const itemInfo = defaultScope['webapp.video-detail']?.itemInfo?.itemStruct;
            
            if (itemInfo && itemInfo.video) {
              return {
                video: itemInfo.video.playAddr || itemInfo.video.downloadAddr || '',
                cover: itemInfo.video.cover || '',
                caption: itemInfo.desc || '',
                author: itemInfo.author?.uniqueId || itemInfo.author || ''
              };
            }
          } catch (e) {
            // ignore
          }
        }

        // Option 3: Direct DOM Selectors (last resort)
        const videoEl = document.querySelector('video') as HTMLVideoElement;
        const videoSrc = videoEl ? videoEl.src : '';
        const authorEl = document.querySelector('[data-e2e="browser-nickname"]');
        const captionEl = document.querySelector('[data-e2e="browse-video-desc"]');

        if (videoSrc) {
          return {
            video: videoSrc,
            cover: '', // Difficult to get cleanly without API
            caption: captionEl ? captionEl.textContent || '' : '',
            author: authorEl ? authorEl.textContent || '' : ''
          };
        }

        return null; // Return null if nothing works
      });

      if (!extractedData) {
        return { success: false, error: 'Could not extract data via browser automation' };
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
