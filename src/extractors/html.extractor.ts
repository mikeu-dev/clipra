import * as cheerio from 'cheerio';
import httpClient from '../providers/httpClient';
import { SessionProvider } from '../providers/sessionProvider';
import { ExtractionResult, TiktokExtraction } from '../types';
import logger from '../utils/logger';

export class HtmlExtractor {
  
  /**
   * Main entry for Layer 1 extraction (Direct HTML Request & Parsing)
   * This is generally faster but may be protected or blocked.
   */
  public async extract(url: string): Promise<ExtractionResult> {
    try {
      // Apply session cookies if we have them
      const headers: any = {};
      SessionProvider.applyToHeaders(headers);

      const response = await httpClient.client.get(url, { headers });
      const html = response.data;
      const $ = cheerio.load(html);

      // Strategy 1: Look for SIGI_STATE
      const sigiStateData = this.parseSigiState($);
      if (sigiStateData) {
        return { success: true, data: sigiStateData };
      }

      // Strategy 2: Look for Universal Data Rehydration (Newer format)
      const universalData = this.parseUniversalData($);
      if (universalData) {
        return { success: true, data: universalData };
      }
      
      return { success: false, error: 'Could not find Sigi State or Universal Data' };
      
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  private parseSigiState($: cheerio.CheerioAPI): TiktokExtraction | null {
    try {
      let sigiStateText = '';
      
      $('script').each((i, el) => {
        const text = $(el).html();
        if (text && text.includes('window[\'SIGI_STATE\']')) {
          sigiStateText = text;
        }
      });

      if (!sigiStateText) return null;

      // Extract JSON using regex
      const match = sigiStateText.match(/window\['SIGI_STATE'\]=(.*?);window/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        
        const videoId = Object.keys(parsed.ItemModule || {})[0];
        if (!videoId) return null;

        const item = parsed.ItemModule[videoId];
        
        return {
          video: item.video?.playAddr || item.video?.downloadAddr || '',
          cover: item.video?.cover || '',
          caption: item.desc || '',
          author: item.author || ''
        };
      }
      return null;
    } catch (e) {
      logger.warn('Failed parsing SIGI_STATE');
      return null;
    }
  }

  private parseUniversalData($: cheerio.CheerioAPI): TiktokExtraction | null {
    try {
      const scriptContent = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html() || $('#SIGI_STATE').html();
      
      if (!scriptContent) return null;
      
      const parsed = JSON.parse(scriptContent);
      
      const defaultScope = parsed['__DEFAULT_SCOPE__'] || parsed;
      const webappVideoDetail = defaultScope['webapp.video-detail'] || {};
      const itemInfo = webappVideoDetail.itemInfo?.itemStruct || {};
      
      if (itemInfo && itemInfo.video) {
        return {
          video: itemInfo.video.playAddr || itemInfo.video.downloadAddr || '',
          cover: itemInfo.video.cover || '',
          caption: itemInfo.desc || '',
          author: itemInfo.author?.uniqueId || itemInfo.author || ''
        };
      }
      
      return null;
    } catch (e) {
      logger.warn('Failed parsing UNIVERSAL_DATA_FOR_REHYDRATION');
      return null;
    }
  }
}
