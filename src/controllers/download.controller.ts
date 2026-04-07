import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
import { HttpClient } from '../providers/httpClient';
import { SessionProvider } from '../providers/sessionProvider';

export class DownloadController {
  /**
   * Proxies a download request to bypass CORS and force attachment disposition.
   * Using a fresh axios instance to avoid global interceptors which might cause 403 on binary files.
   */
  static async handleDownload(req: Request, res: Response) {
    const url = req.query.url as string;
    const type = (req.query.type as string || 'MP4').toUpperCase();
    const ua = req.query.ua as string;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL parameter is required' });
    }

    try {
      logger.info(`[Download Proxy] Fetching: ${url}`);

      // Prepare headers with the SAME UA used during scraping and Session Cookies
      const headers: any = {
        'User-Agent': ua || HttpClient.DEFAULT_UA,
        'Referer': 'https://www.tiktok.com/',
        'Accept': '*/*',
        'Range': 'bytes=0-', // Help bypass some CDN restrictions for media
      };

      // Inject the same cookies used during the scraping phase
      SessionProvider.applyToHeaders(headers);

      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 20000,
        headers: headers
      });

      // Forward content type or default based on type param
      // Note: use response.headers['content-type'] if it exists, otherwise fallback
      const contentType = response.headers['content-type'] || (type === 'MP3' ? 'audio/mpeg' : 'video/mp4');
      const extension = type.toLowerCase();
      const filename = `clipra_download_${Date.now()}.${extension}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Fix for 'NotSameOrigin' and CORS issues
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Forward other useful headers if they exist
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      // Handle stream piping
      response.data.pipe(res);

      response.data.on('error', (err: any) => {
        logger.error(`[Download Proxy] Stream error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Stream error occurred' });
        }
      });

    } catch (error: any) {
      const statusCode = error.response?.status || 500;
      const errorMsg = error.response?.status === 403 
        ? "TikTok CDN rejected the request (403 Forbidden). The link might have expired or security headers were rejected."
        : error.message;

      logger.error(`[Download Proxy] Error ${statusCode}: ${errorMsg}`);
      
      return res.status(statusCode).json({ 
        success: false, 
        error: errorMsg,
        suggestion: statusCode === 403 ? "Please try to scrape the URL again to get a fresh download link." : undefined
      });
    }
  }
}
