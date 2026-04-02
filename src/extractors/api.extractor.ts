import { ExtractionResult } from '../types';
import httpClient from '../providers/httpClient';
import { SessionProvider } from '../providers/sessionProvider';
import { Helpers } from '../utils/helpers';
import logger from '../utils/logger';

export class ApiExtractor {
  /**
   * Layer 3: Reverse Engineered Endpoint Extractor
   * Utilizes TikTok's internal API directly mapping to video ID.
   */
  public async extract(url: string): Promise<ExtractionResult> {
    try {
      // 1. Resolve redirect if shortlink
      const finalUrl = await Helpers.expandUrl(url);

      // 2. Extract video ID
      const videoId = Helpers.extractVideoId(finalUrl);
      if (!videoId) {
        return { success: false, error: 'Could not extract Video ID from URL' };
      }

      // 3. Call TikTok internal feed API with Session Support
      const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
      
      const headers: any = {
        'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet'
      };

      // Try to inject existing session cookies
      SessionProvider.applyToHeaders(headers);

      const response = await httpClient.client.get(apiUrl, { headers });

      const awemeList = response.data?.aweme_list;
      if (awemeList && awemeList.length > 0) {
        const item = awemeList[0];
        
        // Handle image_post_info if exists (Slideshow)
        if (item.image_post_info && item.image_post_info.images) {
          return {
            success: true,
            data: {
              type: 'image',
              images: item.image_post_info.images.map((img: any) => img.display_image?.url_list[0] || img.owner_watermark_image?.url_list[0] || ''),
              cover: item.video?.cover?.url_list[0] || '',
              caption: item.desc || '',
              author: item.author?.nickname || item.author?.unique_id || ''
            }
          };
        }

        return {
          success: true,
          data: {
            type: 'video',
            video: item.video?.play_addr?.url_list[0] || item.video?.download_addr?.url_list[0] || '',
            cover: item.video?.cover?.url_list[0] || '',
            caption: item.desc || '',
            author: item.author?.nickname || item.author?.unique_id || ''
          }
        };
      }

      return { success: false, error: 'API returned successful status but no aweme items found' };
    } catch (e: any) {
      logger.error(`API Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}
