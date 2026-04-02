import httpClient from '../providers/httpClient';
import logger from './logger';

export class Helpers {
  /**
   * Mengambil URL akhir dari link pendek (seperti vm.tiktok.com atau vt.tiktok.com)
   * Menyelesaikan redirection.
   */
  public static async expandUrl(url: string): Promise<string> {
    try {
      if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com') || url.includes('t.co')) {
        // Axios will follow redirects by default up to maxRedirects
        // Let's get the final URL
        const response = await httpClient.client.get(url, {
          maxRedirects: 5,
          validateStatus: (status) => status < 400
        });
        return response.request.res.responseUrl || url;
      }
      return url;
    } catch (e: any) {
      logger.warn(`Failed to expand URL ${url}: ${e.message}`);
      return url;
    }
  }

  /**
   * Mengekstrak Video ID dari URL panjang TikTok
   */
  public static extractVideoId(url: string): string | null {
    // Mencari format video/123456789...
    const match = url.match(/\/video\/(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
}
