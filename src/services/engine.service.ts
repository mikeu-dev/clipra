import { StrategyResult, TiktokExtraction } from '../types';
import { HtmlExtractor } from '../extractors/html.extractor';
import { ApiExtractor } from '../extractors/api.extractor';
import { BrowserExtractor } from '../extractors/browser.extractor';
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
    let attempt = 0;
    let lastError = '';

    while (attempt <= retryCount) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.info(`Retry attempt ${attempt} for ${url}. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // Strategy 1: Fast HTTP + HTML/Hydration Extraction
        logger.info(`[Attempt ${attempt}] Extracting via Layer 1 (HTTP)`);
        const httpResult = await this.htmlExtractor.extract(url);
        
        if (httpResult.success && httpResult.data && this.isValidExtraction(httpResult.data)) {
          return { ...httpResult, layer: 'Layer 1 (HTML/Hydration)' };
        } else {
          logger.warn(`Layer 1 failed: ${httpResult.error}. Moving to Layer 3...`);
        }

        // Strategy 2: Reverse Engineered API Extraction (Layer 3)
        logger.info(`[Attempt ${attempt}] Extracting via Layer 3 (Internal API)`);
        const apiResult = await this.apiExtractor.extract(url);
        
        if (apiResult.success && apiResult.data && this.isValidExtraction(apiResult.data)) {
          return { ...apiResult, layer: 'Layer 3 (Internal API)' };
        } else {
          logger.warn(`Layer 3 failed: ${apiResult.error}. Moving to Layer 4...`);
        }

        // Strategy 3: (Fallback) Headless Browser Automation (Layer 4)
        logger.info(`[Attempt ${attempt}] Extracting via Layer 4 (Browser Automation)`);
        const browserResult = await this.browserExtractor.extract(url);
        
        if (browserResult.success && browserResult.data && this.isValidExtraction(browserResult.data)) {
          // If browser succeeds, we likely have a session now (captured during extraction)
          return { ...browserResult, layer: 'Layer 4 (Browser)' };
        } else {
          lastError = browserResult.error || 'Unknown error';
          logger.warn(`Layer 4 failed: ${lastError}`);
        }
      } catch (e: any) {
        lastError = e.message;
        logger.error(`Exception during attempt ${attempt}: ${lastError}`);
      }
      
      attempt++;
    }

    return {
      success: false,
      error: `All layers and retries failed. Final error: ${lastError}`,
      layer: 'None'
    };
  }

  /**
   * Validates if the extracted data meets the minimum requirements
   */
  private isValidExtraction(data: TiktokExtraction): boolean {
    return !!(data.video && (data.cover || data.author));
  }
}
