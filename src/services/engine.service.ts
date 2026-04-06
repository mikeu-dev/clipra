import { StrategyResult, TiktokExtraction } from '../types';
import { HtmlExtractor } from '../extractors/html.extractor';
import { ApiExtractor } from '../extractors/api.extractor';
import { BrowserExtractor } from '../extractors/browser.extractor';
import { cacheService } from '../utils/cache';
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
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, attempt) * 1000;
        logger.info(`[Retry ${attempt}/${retryCount}] Waiting ${delay}ms before next attempt for ${url}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // Strategy 1: Fast HTTP + HTML/Hydration Extraction
        logger.info(`[Attempt ${attempt}] Layer 1 (HTTP/Hydration) started...`);
        const httpResult = await this.htmlExtractor.extract(url);
        
        if (httpResult.success && httpResult.data && this.isValidExtraction(httpResult.data)) {
          logger.info(`[Success] Data extracted via Layer 1 on attempt ${attempt}`);
          const finalResult: StrategyResult = { ...httpResult, layer: 'Layer 1 (HTML/Hydration)' };
          
          // Save to cache before returning
          cacheService.set(cacheKey, finalResult);
          
          return finalResult;
        }
        
        // Check for specific "10204" or similar blocking indicators
        if (httpResult.error?.includes('10204') || httpResult.error?.includes('unavailable')) {
          logger.warn(`Layer 1 suspected blocking (10204/Unavailable). Proceeding to deeper layers.`);
        } else {
          logger.warn(`Layer 1 failed: ${httpResult.error}`);
        }

        // Strategy 2: Reverse Engineered API Extraction (Layer 3)
        logger.info(`[Attempt ${attempt}] Layer 3 (Internal API) started...`);
        const apiResult = await this.apiExtractor.extract(url);
        
        if (apiResult.success && apiResult.data && this.isValidExtraction(apiResult.data)) {
          logger.info(`[Success] Data extracted via Layer 3 on attempt ${attempt}`);
          const finalResult: StrategyResult = { ...apiResult, layer: 'Layer 3 (Internal API)' };
          
          // Save to cache before returning
          cacheService.set(cacheKey, finalResult);
          
          return finalResult;
        }
        
        if (apiResult.error?.includes('10204')) {
          logger.warn(`Layer 3 returned 10204 (IP/Session Blocked). Moving to Browser Fallback.`);
        } else {
          logger.warn(`Layer 3 failed: ${apiResult.error}`);
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

