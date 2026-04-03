import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/error';
import { EngineService } from '../services/engine.service';
import logger from '../utils/logger';

// Create a singleton instance to preserve session across requests
const engineService = new EngineService();

export class ScrapeController {
  static async handleScrapeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const url = (req.query?.url as string) || (req.body?.url as string);

      if (!url) {
        throw new AppError('URL parameter "?url=" or "url" in body is required', 400);
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

  /**
   * Compatibility endpoint for TikWM style requests
   */
  static async handleTikwmCompatibility(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    try {
      const url = (req.body?.url as string) || (req.query?.url as string);

      if (!url) {
        return res.status(200).json({
          code: -1,
          msg: 'URL parameter is required',
          processed_time: (Date.now() - startTime) / 1000
        });
      }

      logger.info(`[Compatibility API] Scrape Request for: ${url}`);
      const result = await engineService.extract(url);

      if (!result.success || !result.data) {
        return res.status(200).json({
          code: -1,
          msg: result.error || 'Failed to extract data',
          processed_time: (Date.now() - startTime) / 1000
        });
      }

      const d = result.data;
      
      // Map Clipra TiktokExtraction to TikWM VideoData
      return res.status(200).json({
        code: 0,
        msg: 'success',
        processed_time: (Date.now() - startTime) / 1000,
        data: {
          id: d.id,
          title: d.caption,
          cover: d.cover,
          origin_cover: d.cover,
          play: d.video || d.hdplay,
          wmplay: d.wmplay || d.video,
          hdplay: d.hdplay || d.video,
          music: d.music,
          images: d.images,
          author: {
            nickname: typeof d.author === 'string' ? d.author : d.author?.nickname || '',
            unique_id: typeof d.author === 'string' ? d.author : d.author?.uniqueId || ''
          }
        }
      });
    } catch (error: any) {
      logger.error(`[Compatibility API] Error: ${error.message}`);
      return res.status(200).json({
        code: -1,
        msg: error.message || 'Internal Server Error',
        processed_time: (Date.now() - startTime) / 1000
      });
    }
  }
}
