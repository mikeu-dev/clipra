import { Page } from 'puppeteer-core';
import { BrowserProvider } from '../providers/browserPool';
import { SessionProvider } from '../providers/sessionProvider';
import { ExtractionResult, TiktokExtraction } from '../types';
import logger from '../utils/logger';
import fs from 'fs';

export class BrowserExtractor {
  /**
   * Main entry for Layer 4 extraction (Headless Browser)
   */
  public async extract(url: string): Promise<ExtractionResult> {
    let page: Page | null = null;
    try {
      logger.info(`[Browser] Starting extraction for: ${url}`);
      page = await BrowserProvider.getWarmPage();
      const currentBrowser = page.browser();

      const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
      await page.setUserAgent(desktopUA);
      await page.setViewport({ width: 1920, height: 1080 });

      let capturedVideoUrl = '';
      let apiData: any = null;

      page.on('request', (request) => {
          const u = request.url();
          if ((u.includes('.mp4') || u.includes('/video/tos/') || u.includes('v16-webapp-prime')) && 
              (u.includes('tiktokcdn.com') || u.includes('tiktok.com'))) {
              if (!capturedVideoUrl) {
                  capturedVideoUrl = u;
                  logger.info(`[Browser] Intercepted video stream URL.`);
              }
          }
      });

      page.on('response', async (response) => {
        const resUrl = response.url();
        if (resUrl.includes('/api/item/detail') || resUrl.includes('/api/v1/item/detail')) {
          try {
            const data = await response.json();
            const item = data?.item_list?.[0] || data?.aweme_details?.[0] || data?.item_detail || data?.aweme_detail || data?.itemInfo?.itemStruct;
            if (item) {
              apiData = item;
              logger.info('[Browser] Captured internal API JSON.');
            }
          } catch (e) {}
        }
      });

      try {
        logger.info('[Browser] Navigating to page (Referer: Google)...');
        // Mask the origin as Google search result
        await page.setExtraHTTPHeaders({
            'Referer': 'https://www.google.com/',
        });
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        
        // Random wait to mimic human 
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

        logger.info('[Browser] Page loaded, searching for video player...');
        await page.evaluate(async () => {
            const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
            window.scrollBy(0, 100 + Math.random() * 200);
            await delay(500 + Math.random() * 500);
            window.scrollBy(0, 200 + Math.random() * 300);
            await delay(500 + Math.random() * 500);
            
            const targets = document.querySelectorAll('div[class*="PlayIcon"], div[class*="VideoContainer"], div[class*="VideoWrapper"], img, button[aria-label="Go to next slide"]');
            if (targets.length > 0) {
                // Click a few times to trigger loading if it's a slideshow
                const target = targets[Math.floor(Math.random() * Math.min(targets.length, 3))] as HTMLElement;
                target.click();
                await delay(500);
                const nextBtn = document.querySelector('button[aria-label="Go to next slide"]') as HTMLElement;
                if (nextBtn) nextBtn.click();
            }
        });

        // Wait up to 8s or until we get the URL (Reduced from 12s for speed)
        logger.info('[Browser] MONITORING: Looking for MP4 link...');
        for(let i=0; i<16; i++) {
            if (capturedVideoUrl) {
                logger.info('[Browser] SUCCESS: Captured video URL via network.');
                break;
            }
            
            // Check for captcha mid-wait
            if (i % 2 === 0) {
                const hasCaptcha = await page.evaluate(() => !!document.querySelector('#captcha_container') || document.body.innerText.includes('Verify to continue'));
                if (hasCaptcha) {
                    logger.warn('[Browser] ABORT: CAPTCHA detected!');
                    break;
                }
            }
            
            await new Promise(r => setTimeout(r, 500)); // Check every 500ms instead of 1000ms
        }
        
      } catch (e: any) {
        logger.warn(`Browser navigation/interaction timed out or failed: ${e.message}`);
      }

      const mapResult = (item: any, videoUrl: string): TiktokExtraction => {
        const videoObj = item.video || {};
        const images = Array.isArray(item.image_post?.images || item.imagePost?.images) 
          ? (item.image_post?.images || item.imagePost?.images).map((img: any) => 
              img.display_addr?.url_list?.[0] || img.displayAddr || img.image_url?.url_list?.[0] || ''
            ).filter((u: string) => u !== '') 
          : [];

        return {
          id: String(item.aweme_id || item.id || ''),
          type: 'video', 
          video: videoUrl || videoObj.play_addr?.url_list?.[0] || '',
          hdplay: videoUrl || videoObj.play_addr?.url_list?.[0] || '',
          wmplay: videoUrl || videoObj.download_addr?.url_list?.[0] || '',
          images: images,
          cover: videoObj.cover?.url_list?.[0] || '',
          caption: item.desc || '',
          author: item.author?.unique_id || item.author?.nickname || '',
          music: item.music?.play_url?.url_list?.[0] || ''
        };
      };

      if (apiData || capturedVideoUrl) {
        logger.info(`[Browser] Success! Found video via ${apiData ? 'API' : 'Network'}.`);
        const result = mapResult(apiData || {}, capturedVideoUrl);
        await SessionProvider.captureFromPage(page).catch(() => null); // Always capture session
        const session = SessionProvider.getSession();
        return { success: true, data: result, userAgent: session?.userAgent || desktopUA };
      }

      // DEEP DOM SCANNING: Last resort if everything above failed
      logger.info('[Browser] Captured URL/API failed, attempting Deep DOM Scan...');
      const deepScanResult = await page.evaluate(() => {
          const findVideoInDOM = (): string => {
              // 1. Try all video elements
              const videos = Array.from(document.querySelectorAll('video'));
              for (const v of videos) {
                  if (v.src && v.src.startsWith('http')) return v.src;
                  const source = v.querySelector('source');
                  if (source && source.src) return source.src;
              }
              
              // 2. Try window variables (NEXT_DATA, SIGI_STATE)
              const win = window as any;
              const jsonFind = (obj: any, target: string): string => {
                  if (!obj || typeof obj !== 'object') return '';
                  if (typeof obj[target] === 'string' && obj[target].includes('tiktokcdn.com')) return obj[target];
                  for (const k in obj) {
                      const res = jsonFind(obj[k], target);
                      if (res) return res;
                  }
                  return '';
              };
              
              return jsonFind(win.__NEXT_DATA__, 'play_addr') || 
                     jsonFind(win.__NEXT_DATA__, 'playAddr') || 
                     jsonFind(win.SIGI_STATE, 'play_addr') || 
                     jsonFind(win.SIGI_STATE, 'playAddr') || 
                     jsonFind(win.__UNIVERSAL_DATA_FOR_REHYDRATION__, 'play_addr') || 
                     jsonFind(win.__UNIVERSAL_DATA_FOR_REHYDRATION__, 'playAddr') || '';
          };
          return findVideoInDOM();
      }).catch(() => '');

      if (deepScanResult) {
          logger.info('[Browser] Success! Found video via Deep DOM Scan.');
          const result = mapResult({}, deepScanResult);
          await SessionProvider.captureFromPage(page).catch(() => null);
          return { success: true, data: result, userAgent: desktopUA };
      }

      // If we got here, we truly failed to find any video link
      await SessionProvider.captureFromPage(page).catch(() => null);

      logger.warn('[Browser] All extraction methods failed, saving debug state.');
      await page.screenshot({ path: 'debug-browser-failed.png' });
      return { success: false, error: 'Could not find slideshow/video data.' };

    } catch (e: any) {
      logger.error(`[Browser] Critical Catch: ${e.message}`);
      return { success: false, error: e.message || 'Unknown browser error' };
    } finally {
      if (page) await BrowserProvider.releasePage(page).catch(() => {});
    }
  }
}
