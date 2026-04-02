import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/error';
import { EngineService } from '../services/engine.service';
import logger from '../utils/logger';

// Create a singleton instance to preserve session across requests
const engineService = new EngineService();

export class ScrapeController {
  static async handleScrapeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const url = req.query.url as string;

      if (!url) {
        throw new AppError('URL parameter "?url=" is required', 400);
      }

      // Basic validation for URL
      try {
        new URL(url);
      } catch (e) {
        throw new AppError('Invalid URL provided', 400);
      }

      if (!url.includes('tiktok.com')) {
        throw new AppError('URL must be a valid TikTok link', 400);
      }

      logger.info(`[API] Scrape Request for: ${url}`);
      
      const result = await engineService.extract(url);

      if (!result.success) {
        // Return 422 for blocking issues so client knows it is a scraping failure, not server crash
        return res.status(422).json({
          success: false,
          error: result.error || 'Failed to extract data',
          layer: result.layer
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        metadata: {
          layer: result.layer,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }
}
