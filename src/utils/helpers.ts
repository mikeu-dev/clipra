import httpClient from '../providers/httpClient';
import logger from './logger';

export class Helpers {
  /**
   * Mengambil URL akhir dari link pendek (seperti vm.tiktok.com atau vt.tiktok.com)
   * Menyelesaikan redirection.
   */
  public static async asyncExpandUrl(url: string, depth: number = 0): Promise<string> {
    if (depth > 5) return url;
    try {
      const response = await httpClient.client.get(url, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 300 && status < 400
      });
      const location = response.headers.location;
      if (location) {
        // If relative path
        const nextUrl = location.startsWith('http') ? location : new URL(location, url).href;
        return this.asyncExpandUrl(nextUrl, depth + 1);
      }
      return url;
    } catch (e: any) {
      if (e.response && e.response.status >= 300 && e.response.status < 400) {
        const location = e.response.headers.location;
        if (location) {
          const nextUrl = location.startsWith('http') ? location : new URL(location, url).href;
          return this.asyncExpandUrl(nextUrl, depth + 1);
        }
      }
      return url;
    }
  }

  public static async expandUrl(url: string): Promise<string> {
    if (!url.includes('tiktok.com') && !url.includes('t.co')) return url;
    return this.asyncExpandUrl(url);
  }

  /**
   * Mengekstrak Video ID dari URL panjang TikTok
   */
  public static extractVideoId(url: string): string | null {
    // Mencari format video/123456789... atau photo/123456789...
    const match = url.match(/\/(video|photo|v)\/(\d+)/);
    if (match && match[2]) {
      return match[2];
    }
    
    // Fallback untuk URL format lainnya yang hanya berisi angka di akhir (setelah user ID)
    const fallbackMatch = url.match(/\/(\d+)(\?|$)/);
    if (fallbackMatch && fallbackMatch[1] && fallbackMatch[1].length > 15) {
      return fallbackMatch[1];
    }
    
    return null;
  }
}
