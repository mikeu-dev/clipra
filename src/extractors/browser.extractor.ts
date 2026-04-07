import { BrowserProvider } from '../providers/browserPool';
import { SessionProvider } from '../providers/sessionProvider';
import { ExtractionResult, TiktokExtraction } from '../types';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

export class BrowserExtractor {
  /**
   * Main entry for Layer 4 extraction (Headless Browser)
   */
  public async extract(url: string): Promise<ExtractionResult> {
    let browser = null;
    try {
      browser = await BrowserProvider.launch();
      const page = await browser.newPage();
      await BrowserProvider.optimizePage(page);

      const forcedUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
      await page.setUserAgent(forcedUA);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e) {
        logger.warn('Initial navigation timeout, continuing anyway...');
      }

      // Check for blocks
      const pageStatus = await page.evaluate(() => {
        const text = document.body.innerText;
        if (text.includes('Video currently unavailable') || text.includes('Video ini tidak tersedia')) return 'UNAVAILABLE';
        if (text.includes('Verify to continue') || document.querySelector('#captcha_container')) return 'CAPTCHA';
        return 'OK';
      });

      if (pageStatus !== 'OK') return { success: false, error: `TikTok blocked access: ${pageStatus}` };

      // 1. Pull ALL Script contents to parse server-side (Much more reliable than evaluate)
      const scripts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script'))
          .map(s => s.textContent || '')
          .filter(t => t.length > 500); // Only large scripts likely containing data
      });

      const findItemInObject = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.itemStruct && (obj.itemStruct.video || obj.itemStruct.imagePost)) return obj.itemStruct;
        if (obj.id && (obj.video || obj.imagePost)) return obj;
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (key === 'parent' || key === '_root' || key === '__DEFAULT_SCOPE__') continue;
            try {
              const found = findItemInObject(obj[key]);
              if (found) return found;
            } catch (e) {}
          }
        }
        return null;
      };

      let item = null;
      for (const scriptText of scripts) {
        try {
          let data = null;
          if (scriptText.trim().startsWith('{')) {
            data = JSON.parse(scriptText);
          } else if (scriptText.includes('SIGI_STATE')) {
            const match = scriptText.match(/SIGI_STATE\s*=\s*({.*?});/s) || 
                          scriptText.match(/window\['SIGI_STATE'\]=(.*?);window/s);
            if (match && match[1]) data = JSON.parse(match[1]);
          }

          if (data) {
            item = findItemInObject(data);
            if (item) break;
          }
        } catch (e) {}
      }

      // 2. Global Regex Fallback on Full Page Content
      if (!item) {
        logger.info('Script extraction failed, trying aggressive Global Regex...');
        const content = await page.content();
        // Look for itemStruct patterns in the whole HTML
        const matches = content.match(/\{"[^"]+":\{"itemStruct":\{.*?\}/g);
        if (matches) {
          for (const m of matches) {
            try {
              item = findItemInObject(JSON.parse(m));
              if (item) break;
            } catch (e) {}
          }
        }
      }

      if (item) {
        const imagesList = item.imagePost?.images?.map((img: any) => 
          img.imageURL?.urlList?.[0] || img.displayAddr || img.urlList?.[0] || ''
        ).filter((u: string) => u !== '') || [];

        const result: TiktokExtraction = {
          id: item.id || '',
          type: item.imagePost ? 'image' : 'video',
          video: item.video?.playAddr || item.video?.downloadAddr || '',
          hdplay: item.video?.playAddr || '',
          wmplay: item.video?.downloadAddr || '',
          images: imagesList,
          cover: item.video?.cover || item.imagePost?.cover?.displayAddr || item.imagePost?.cover?.urlList?.[0] || '',
          caption: item.desc || '',
          author: item.author?.uniqueId || item.author?.nickname || item.author || '',
          music: item.music?.playUrl || item.music?.playAddr || ''
        };

        const session = await SessionProvider.captureFromPage(page);
        return { success: true, data: result, userAgent: session?.userAgent || forcedUA };
      }

      logger.warn('Browser extraction failed, capturing debug data...');
      await page.screenshot({ path: 'debug-browser-fallback.png', fullPage: true });
      fs.writeFileSync('debug-browser-fallback.html', await page.content());
      return { success: false, error: 'Could not find slideshow/video data in page scripts.' };

    } catch (e: any) {
      logger.error(`Browser Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
}
