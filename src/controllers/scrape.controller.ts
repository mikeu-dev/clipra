import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../utils/error';
import { EngineService } from '../services/engine.service';
import logger from '../utils/logger';

// Create a singleton instance to preserve session across requests
const engineService = new EngineService();

export class ScrapeController {
  static async handleScrapeRequest(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
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
          layer: result.layer,
          processed_time: (Date.now() - startTime) / 1000
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        metadata: {
          layer: result.layer,
          is_cached: result.isCached || false,
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          processed_time: (Date.now() - startTime) / 1000
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
      
      // CRITICAL: If video URL is missing even after all layers, return failure 
      // so the frontend can failover to secondary API (TikWM) for the MP4 link.
      if (!d.video && !d.hdplay) {
        return res.status(200).json({
          code: -1,
          msg: 'Video link missing. Triggering failover.',
          processed_time: (Date.now() - startTime) / 1000
        });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}/scrape/download`;
      const proxify = (url: string | undefined, type: string = 'MP4', ua?: string) => {
        if (!url) return '';
        // If it's already a proxied URL or doesn't look like a TikTok CDN URL, return as is
        if (url.includes(baseUrl) || !url.includes('tiktokcdn.com')) return url;
        
        return `${baseUrl}?url=${encodeURIComponent(url)}&type=${type}${ua ? `&ua=${encodeURIComponent(ua)}` : ''}`;
      };

      // Map Clipra TiktokExtraction to TikWM VideoData
      return res.status(200).json({
        code: 0,
        msg: 'success',
        processed_time: (Date.now() - startTime) / 1000,
        data: {
          id: d.id,
          type: 0, // 0 = Video, 1 = Images in TikWM style. Always use 0 to show download button.
          title: d.caption,
          cover: d.cover,
          origin_cover: d.cover,
          play: proxify(d.video || d.hdplay, 'MP4', d.userAgent),
          wmplay: proxify(d.wmplay || d.video, 'MP4', d.userAgent),
          hdplay: proxify(d.hdplay || d.video, 'MP4', d.userAgent),
          music: proxify(d.music, 'MP3', d.userAgent),
          images: d.images?.map(img => proxify(img, 'JPG', d.userAgent)),
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
