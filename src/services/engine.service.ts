import { StrategyResult, TiktokExtraction } from '../types';
import { HtmlExtractor } from '../extractors/html.extractor';
import { ApiExtractor } from '../extractors/api.extractor';
import { BrowserExtractor } from '../extractors/browser.extractor';
import { cacheService } from '../utils/cache';
import { Helpers } from '../utils/helpers';
import logger from '../utils/logger';

export class EngineService {
  private htmlExtractor: HtmlExtractor;
  private apiExtractor: ApiExtractor;
  private browserExtractor: BrowserExtractor;

  constructor() {
    this.htmlExtractor = new HtmlExtractor();
    this.apiExtractor = new ApiExtractor();
    this.browserExtractor = new BrowserExtractor();
  }

  /**
   * Main orchestrator function for the scraper engine.
   * It attempts layer 1 (HTML/Hydration Extraction), layer 3 (API Extraction), and falls back to Layer 4 (Browser Automation).
   */
  public async extract(url: string, retryCount: number = 2): Promise<StrategyResult> {
    // 1. Check cache first
    const cacheKey = `tiktok:url:${Buffer.from(url).toString('base64')}`;
    const cachedResult = cacheService.get<StrategyResult>(cacheKey);
    
    if (cachedResult) {
      logger.info(`[Cache] Hit for ${url}`);
      return { ...cachedResult, isCached: true };
    }

    let attempt = 0;
    let lastError = '';

    while (attempt <= retryCount) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.info(`[Retry ${attempt}/${retryCount}] Waiting ${delay}ms before next attempt for ${url}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // Fast Track (Optimized Phase 2): Race Layer 1 and Layer 3 in Parallel
        const initialVideoId = Helpers.extractVideoId(url);
        
        if (initialVideoId) {
          logger.info(`[Attempt ${attempt}] Video ID detected. Racing Layer 1 (HTML) & Layer 3 (API) in parallel...`);
          
          // Racing both methods to see which one is faster
          const results = await Promise.allSettled([
            this.htmlExtractor.extract(url),
            this.apiExtractor.extract(url)
          ]);

          // Find the first successful and valid result
          for (let i = 0; i < results.length; i++) {
            const res = results[i];
            if (res.status === 'fulfilled' && res.value.success && res.value.data && this.isValidExtraction(res.value.data, url)) {
              const layerName = i === 0 ? 'Layer 1 (HTML-Race)' : 'Layer 3 (API-Race)';
              logger.info(`[Success] ${layerName} won the race.`);
              const finalResult: StrategyResult = { ...res.value, layer: layerName };
              cacheService.set(cacheKey, finalResult);
              return finalResult;
            }
          }
          
          logger.warn(`[Attempt ${attempt}] Both Parallel Layers failed. Proceeding to fallback logic.`);
        } else {
          // If no initial video ID, we must go sequential or expand URL first
          // Strategy 1: Fast HTTP + HTML/Hydration Extraction
          logger.info(`[Attempt ${attempt}] Layer 1 (HTTP/Hydration) started...`);
          const httpResult = await this.htmlExtractor.extract(url);
          
          if (httpResult.success && httpResult.data && this.isValidExtraction(httpResult.data, url)) {
            const finalResult: StrategyResult = { ...httpResult, layer: 'Layer 1 (HTML/Hydration)' };
            cacheService.set(cacheKey, finalResult);
            return finalResult;
          }

          // Strategy 2: API Extraction
          logger.info(`[Attempt ${attempt}] Layer 3 (Internal API) started...`);
          const apiResult = await this.apiExtractor.extract(url);
          
          if (apiResult.success && apiResult.data && this.isValidExtraction(apiResult.data, url)) {
            const finalResult: StrategyResult = { ...apiResult, layer: 'Layer 3 (Internal API)' };
            cacheService.set(cacheKey, finalResult);
            return finalResult;
          }
        }

        // Strategy 3: (Fallback) Headless Browser Automation (Layer 4)
        logger.info(`[Attempt ${attempt}] Layer 4 (Browser Automation) started...`);
        const browserResult = await this.browserExtractor.extract(url);
        
        if (browserResult.success && browserResult.data && this.isValidExtraction(browserResult.data, url)) {
          logger.info(`[Success] Data extracted via Layer 4 on attempt ${attempt}. Session refreshed.`);
          const finalResult: StrategyResult = { ...browserResult, layer: 'Layer 4 (Browser)' };
          
          // Save to cache before returning
          cacheService.set(cacheKey, finalResult);
          
          return finalResult;
        } else {
          lastError = browserResult.error || 'Unknown error';
          logger.error(`Layer 4 failed: ${lastError}`);
        }
      } catch (e: any) {
        lastError = e.message;
        logger.error(`Exception during attempt ${attempt}: ${lastError}`);
      }
      
      attempt++;
    }

    return {
      success: false,
      error: `All layers failed after ${retryCount + 1} attempts. Final error: ${lastError}`,
      layer: 'None'
    };
  }

  /**
   * Validates if the extracted data meets the minimum requirements
   */
  private isValidExtraction(data: TiktokExtraction, url: string): boolean {
    const isSlideshowUrl = url.includes('/photo/') || url.includes('/slideshow/');
    const isSlideshowData = !!(data.images && data.images.length > 1);
    const isSlideshow = isSlideshowUrl || isSlideshowData;
    
    const hasVideo = !!(data.video && data.video.length > 20);
    const hasImages = !!(data.images && data.images.length > 0);
    const hasMeta = !!(data.cover || data.author);
    
    // For slideshows, we strongly desire the video (MP4 render).
    // If it's a slideshow but we only have images and NO video, we don't consider it 
    // a "final" success yet, allowing it to move to Layer 4 (Browser) to find the MP4.
    if (isSlideshow && !hasVideo && hasImages) {
      logger.info('[Engine] Detected slideshow without MP4. Forcing next layer...');
      return false; 
    }

    // Standard video: must have video link
    if (!isSlideshow && !hasVideo) {
      return false;
    }

    // Valid if it has either video OR images, plus minimal metadata
    return (hasVideo || hasImages) && hasMeta;
  }
}

