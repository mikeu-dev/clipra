import { ExtractionResult, TiktokExtraction } from '../types';
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

      // 3. Call TikTok internal feed API with Session Support
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
        'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
        'Accept-Encoding': 'gzip, deflate, br'
      };

      // Try to inject existing session cookies
      SessionProvider.applyToHeaders(headers);

      const response = await httpClient.client.get(apiUrl, { headers });

      const awemeList = response.data?.aweme_list;
      if (!awemeList || awemeList.length === 0) {
        return { success: false, error: 'API returned successful status but no aweme items found' };
      }

      const item = awemeList[0];
      
      // Determine if it's a slideshow/photo post
      const images: string[] = [];
      if (item.image_post_info?.images) {
        item.image_post_info.images.forEach((img: any) => {
          const url = img.display_image?.url_list?.[0] || img.owner_watermark_image?.url_list?.[0];
          if (url) images.push(url);
        });
      }

      // Find the best video (might be a slideshow rendered video)
      let bestVideoUrl = '';
      if (item.video) {
        if (item.video.bit_rate && item.video.bit_rate.length > 0) {
          // Filter out tiny black placeholders (>30KB)
          const validVariants = item.video.bit_rate.filter((br: any) => {
            const size = br.play_addr?.data_size || 0;
            return size > 30000;
          });

          if (validVariants.length > 0) {
            const best = validVariants.sort((a: any, b: any) => (b.play_addr?.data_size || 0) - (a.play_addr?.data_size || 0))[0];
            bestVideoUrl = best.play_addr?.url_list?.[0];
          }
        }
        
        if (!bestVideoUrl) {
          bestVideoUrl = item.video.play_addr?.url_list?.[0] || item.video.download_addr?.url_list?.[0] || '';
        }
      }

      const result: TiktokExtraction = {
        id: item.aweme_id || videoId,
        type: images.length > 0 ? 'image' : 'video',
        video: bestVideoUrl,
        hdplay: bestVideoUrl,
        wmplay: bestVideoUrl,
        images: images,
        cover: item.video?.cover?.url_list?.[0] || '',
        caption: item.desc || '',
        author: item.author?.unique_id || item.author?.nickname || '',
        music: item.music?.play_url?.url_list?.[0] || '',
        userAgent: headers['User-Agent']
      };

      return { success: true, data: result };

    } catch (e: any) {
      logger.error(`API Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}
