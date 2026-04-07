import { Request, Response } from 'express';
import httpClient from '../providers/httpClient';
import logger from '../utils/logger';
import { AppError } from '../utils/error';

export class DownloadController {
  /**
   * Proxies a download request to bypass CORS and force attachment disposition.
   */
  static async handleDownload(req: Request, res: Response) {
    const url = req.query.url as string;
    const type = (req.query.type as string || 'MP4').toUpperCase();

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    try {
      logger.info(`[Download Proxy] Fetching: ${url}`);

      const response = await httpClient.client.get(url, {
        responseType: 'stream',
        headers: {
          'Referer': 'https://www.tiktok.com/',
        }
      });

      // Forward content type or default based on type param
      const contentType = response.headers['content-type'] || (type === 'MP3' ? 'audio/mpeg' : 'video/mp4');
      const extension = type.toLowerCase();
      const filename = `clipra_download_${Date.now()}.${extension}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Forward other useful headers if they exist
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      response.data.pipe(res);

      response.data.on('error', (err: any) => {
        logger.error(`[Download Proxy] Stream error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Stream error occurred' });
        }
      });

    } catch (error: any) {
      logger.error(`[Download Proxy] Error: ${error.message}`);
      const statusCode = error.response?.status || 500;
      return res.status(statusCode).json({ 
        success: false, 
        error: `Failed to proxy download: ${error.message}` 
      });
    }
  }
}
