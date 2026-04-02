import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/error';
import { EngineService } from '../services/engine.service';
import logger from '../utils/logger';

export class ScrapeController {
  static async handleScrapeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const url = req.query.url as string;

      if (!url) {
        throw new AppError('URL parameter is required', 400);
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

      logger.info(`Received scrape request for URL: ${url}`);
      
      const engineService = new EngineService();
      const result = await engineService.extract(url);

      if (!result.success) {
        throw new AppError(result.error || 'Failed to extract data', 500);
      }

      return res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }
}
