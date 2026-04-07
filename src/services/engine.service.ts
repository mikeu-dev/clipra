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
        // Fast Track: If URL already contains Video ID, skip HTML extraction and go straight to API
        const initialVideoId = Helpers.extractVideoId(url);
        if (initialVideoId) {
          logger.info(`[Attempt ${attempt}] Video ID detected in URL. Skipping to Layer 3 (API)...`);
          const apiResult = await this.apiExtractor.extract(url);
          if (apiResult.success && apiResult.data && this.isValidExtraction(apiResult.data)) {
            const finalResult: StrategyResult = { ...apiResult, layer: 'Layer 3 (Fast-Track API)' };
            cacheService.set(cacheKey, finalResult);
            return finalResult;
          }
        }

        // Strategy 1: Fast HTTP + HTML/Hydration Extraction
        logger.info(`[Attempt ${attempt}] Layer 1 (HTTP/Hydration) started...`);
        const httpResult = await this.htmlExtractor.extract(url);
        
        if (httpResult.success && httpResult.data && this.isValidExtraction(httpResult.data)) {
          const finalResult: StrategyResult = { ...httpResult, layer: 'Layer 1 (HTML/Hydration)' };
          cacheService.set(cacheKey, finalResult);
          return finalResult;
        }

        // Strategy 2: Reverse Engineered API Extraction (Layer 3) - Only if not tried in Fast-Track
        if (!initialVideoId) {
          logger.info(`[Attempt ${attempt}] Layer 3 (Internal API) started...`);
          const apiResult = await this.apiExtractor.extract(url);
          
          if (apiResult.success && apiResult.data && this.isValidExtraction(apiResult.data)) {
            const finalResult: StrategyResult = { ...apiResult, layer: 'Layer 3 (Internal API)' };
            cacheService.set(cacheKey, finalResult);
            return finalResult;
          }
        }

        // Strategy 3: (Fallback) Headless Browser Automation (Layer 4)
        logger.info(`[Attempt ${attempt}] Layer 4 (Browser Automation) started...`);
        const browserResult = await this.browserExtractor.extract(url);
        
        if (browserResult.success && browserResult.data && this.isValidExtraction(browserResult.data)) {
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
  private isValidExtraction(data: TiktokExtraction): boolean {
    if (data.type === 'video') {
      return !!(data.video && (data.cover || data.author));
    } else if (data.type === 'image') {
      return !!(data.images && data.images.length > 0 && (data.cover || data.author));
    }
    return false;
  }
}

