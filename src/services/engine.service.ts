import { StrategyResult, TiktokExtraction } from '../types';
import { HtmlExtractor } from '../extractors/html.extractor';
import { BrowserExtractor } from '../extractors/browser.extractor';
import logger from '../utils/logger';

export class EngineService {
  private htmlExtractor: HtmlExtractor;
  private browserExtractor: BrowserExtractor;

  constructor() {
    this.htmlExtractor = new HtmlExtractor();
    this.browserExtractor = new BrowserExtractor();
  }

  /**
   * Main orchestrator function for the scraper engine.
   * It attempts layer 1 (HTML/Hydration Extraction), and falls back to Layer 4 (Browser Automation).
   */
  public async extract(url: string): Promise<StrategyResult> {
    try {
      // Strategy 1: Fast HTTP + HTML/Hydration Extraction
      logger.info(`Extracting via Layer 1 (HTTP) for: ${url}`);
      const httpResult = await this.htmlExtractor.extract(url);
      
      if (httpResult.success && httpResult.data && this.isValidExtraction(httpResult.data)) {
        return {
          ...httpResult,
          layer: 'Layer 1 (HTML/Hydration)'
        };
      } else {
        logger.warn(`Layer 1 failed or partial data for ${url}: ${httpResult.error}. Falling back to Layer 4...`);
      }
    } catch (e: any) {
      logger.warn(`Exception in Layer 1 for ${url}: ${e.message}. Falling back to Layer 4...`);
    }

    try {
      // Strategy 2: (Fallback) Headless Browser Automation
      logger.info(`Extracting via Layer 4 (Browser Automation) for: ${url}`);
      const browserResult = await this.browserExtractor.extract(url);
      
      if (browserResult.success && browserResult.data && this.isValidExtraction(browserResult.data)) {
        return {
          ...browserResult,
          layer: 'Layer 4 (Browser)'
        };
      }
      
      return {
        success: false,
        error: browserResult.error || 'Failed to extract data using fallback browser strategy',
        layer: 'Layer 4 (Browser)'
      };
    } catch (e: any) {
      logger.error(`Exception in Layer 4 for ${url}: ${e.message}`);
      return {
        success: false,
        error: e.message,
        layer: 'Layer 4 (Browser)'
      };
    }
  }

  /**
   * Validates if the extracted data meets the minimum requirements
   */
  private isValidExtraction(data: TiktokExtraction): boolean {
    return !!(data.video && data.cover);
  }
}
