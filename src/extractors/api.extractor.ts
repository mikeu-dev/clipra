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
      // 1. Try to extract video ID directly first (to save expandUrl call)
      let videoId = Helpers.extractVideoId(url);
      
      // 2. Resolve redirect if no video ID found yet (shortlink)
      if (!videoId) {
        const finalUrl = await Helpers.expandUrl(url);
        videoId = Helpers.extractVideoId(finalUrl);
      }

      if (!videoId) {
        return { success: false, error: 'Could not extract Video ID from URL' };
      }

      // 3. Call TikTok internal feed API with Session Support and Minimal App Params
      const params = new URLSearchParams({
        aweme_id: videoId,
        aid: '1233',
        device_id: Math.floor(Math.random() * 1e19).toString(),
        version_code: '26.2.0',
        device_platform: 'iphone',
        app_name: 'musical_ly',
      });

      const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?${params.toString()}`;
      
      const headers: any = {
        'User-Agent': httpClient.constructor.name === 'HttpClient' ? (httpClient as any).constructor.MOBILE_UA || 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet' : 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
        'Accept-Encoding': 'gzip, deflate, br'
      };

      // Try to inject existing session cookies
      SessionProvider.applyToHeaders(headers);

      const response = await httpClient.client.get(apiUrl, { headers });

      const awemeList = response.data?.aweme_list;
      if (awemeList && awemeList.length > 0) {
        const item = awemeList[0];
        
        // Helper to find the best video from bit_rate (important for slideshows which often have a black placeholder as default)
        const getBestVideo = (videoObj: any) => {
          if (!videoObj) return '';
          if (videoObj.bit_rate && videoObj.bit_rate.length > 0) {
            // Sort by data_size descending to find the actual rendered slideshow
            const sorted = [...videoObj.bit_rate].sort((a, b) => (b.play_addr?.data_size || 0) - (a.play_addr?.data_size || 0));
            // Find the first one with a valid URL
            for (const br of sorted) {
              const url = br.play_addr?.url_list?.[0];
              if (url && !url.includes('placeholder')) return url;
            }
          }
          return videoObj.play_addr?.url_list?.[0] || videoObj.download_addr?.url_list?.[0] || '';
        };

        const bestVideoUrl = getBestVideo(item.video);

        // Handle image_post_info if exists (Slideshow)
        if (item.image_post_info && item.image_post_info.images) {
          return {
            success: true,
            data: {
              id: item.aweme_id,
              type: 'image',
              images: item.image_post_info.images.map((img: any) => img.display_image?.url_list?.[0] || img.owner_watermark_image?.url_list?.[0] || ''),
              video: bestVideoUrl,
              hdplay: bestVideoUrl,
              wmplay: bestVideoUrl,
              cover: item.video?.cover?.url_list?.[0] || '',
              caption: item.desc || '',
              author: item.author?.nickname || item.author?.unique_id || '',
              music: item.music?.play_url?.url_list?.[0] || '',
              userAgent: headers['User-Agent']
            }
          };
        }

        return {
          success: true,
          data: {
            id: item.aweme_id,
            type: 'video',
            video: bestVideoUrl,
            hdplay: item.video?.play_addr?.url_list?.[0] || bestVideoUrl,
            wmplay: item.video?.download_addr?.url_list?.[0] || bestVideoUrl,
            cover: item.video?.cover?.url_list?.[0] || '',
            caption: item.desc || '',
            author: item.author?.nickname || item.author?.unique_id || '',
            music: item.music?.play_url?.url_list?.[0] || '',
            userAgent: headers['User-Agent']
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
