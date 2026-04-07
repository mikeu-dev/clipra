import { ExtractionResult, TiktokExtraction } from '../types';
import httpClient from '../providers/httpClient';
import { SessionProvider } from '../providers/sessionProvider';
import { Helpers } from '../utils/helpers';
import logger from '../utils/logger';
import fs from 'fs';

export class ApiExtractor {
  /**
   * Layer 3: Reverse Engineered Endpoint Extractor
   */
  public async extract(url: string): Promise<ExtractionResult> {
    try {
      let videoId = Helpers.extractVideoId(url);
      if (!videoId) {
        const finalUrl = await Helpers.expandUrl(url);
        videoId = Helpers.extractVideoId(finalUrl);
      }

      if (!videoId) return { success: false, error: 'Could not extract Video ID from URL' };

      const params = new URLSearchParams({
        aweme_id: videoId,
        aid: '1233', // TikTok Android App ID (Stable for photo-posts)
        device_id: Math.floor(Math.random() * 1e19).toString(),
        iid: Math.floor(Math.random() * 1e19).toString(),
        version_code: '270204',
        version_name: '27.2.4',
        device_platform: 'android',
        device_type: 'Pixel 5',
        os_version: '11',
        app_name: 'musical_ly',
        manifest_app_name: 'musical_ly',
        channel: 'googleplay',
        no_watermark: '1',
        hd_video: '1',
        show_internal_api: '1'
      });

      const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/aweme/detail/?${params.toString()}`;
      const headers: any = {
        'User-Agent': 'com.zhiliaoapp.musically/270204 (Linux; U; Android 11; en_US; Pixel 5; Build/RQ3A.210605.005; Cronet/58.0.2991.0)',
        'Accept-Encoding': 'gzip, deflate, br'
      };

      SessionProvider.applyToHeaders(headers);
      const response = await httpClient.client.get(apiUrl, { headers });

      let item = response.data?.aweme_detail;
      
      // FALLBACK: Try Web API detail if Mobile API fails
      if (!item) {
          logger.info('[ApiExtractor] Mobile API failed, trying Web API fallback...');
          const webParams = new URLSearchParams({
              itemId: videoId,
              device_id: Math.floor(Math.random() * 1e19).toString(),
          });
          const webUrl = `https://www.tiktok.com/api/item/detail/?${webParams.toString()}`;
          
          const webHeaders: any = {
              'Referer': 'https://www.tiktok.com/',
              'Accept': 'application/json, text/plain, */*'
          };
          SessionProvider.applyToHeaders(webHeaders);

          try {
              const webRes = await httpClient.client.get(webUrl, { headers: webHeaders });
              item = webRes.data?.itemInfo?.itemStruct || webRes.data?.itemStruct || webRes.data?.aweme_detail;
              
              if (!item) {
                  // Final deep search in rehydration data if API response is still weird
                  const rawString = JSON.stringify(webRes.data);
                  if (rawString.includes('playAddr')) {
                      logger.info('[ApiExtractor] Found video data in raw web response string.');
                  }
              }
          } catch (e: any) {
              logger.warn(`Web API fallback failed: ${e.message}`);
          }
      }

      if (!item) {
          logger.error(`[ApiExtractor] All API attempts failed for ${videoId}`);
          return { success: false, error: 'API returned no video detail' };
      }

      // DEBUG: Save full item to a file for analysis
      if (process.env.DEBUG_EXTRACTION === 'true') {
        fs.writeFileSync('debug-item-raw.json', JSON.stringify(item, null, 2));
        logger.info('[ApiExtractor] Full item data saved to debug-item-raw.json');
      }

      const images: string[] = [];
      const imageList = item.image_post_info?.images || item.imagePost?.images || [];
      if (Array.isArray(imageList)) {
        imageList.forEach((img: any) => {
          const u = img.display_image?.url_list?.[0] || img.displayAddr || img.owner_watermark_image?.url_list?.[0] || img.user_watermark_image?.url_list?.[0];
          if (u) images.push(u);
        });
      }

      let bestVideoUrl = '';
      const videoObj = item.video || {};
      
      // Priority 1: Direct Play Addr
      bestVideoUrl = videoObj.play_addr?.url_list?.[0] || videoObj.playAddr || videoObj.download_addr?.url_list?.[0] || '';
      
      // Priority 2: Slideshow specific video address
      if (!bestVideoUrl && item.image_post_info?.video) {
         bestVideoUrl = item.image_post_info.video.play_addr?.url_list?.[0] || item.image_post_info.video.download_addr?.url_list?.[0] || '';
      }
      if (!bestVideoUrl && item.imagePost?.video) {
         bestVideoUrl = item.imagePost.video.playAddr || item.imagePost.video.downloadAddr || '';
      }
      
      // Priority 3: Fallback search in all objects for 'play_addr'
      if (!bestVideoUrl) {
          const deepSearch = (obj: any): string => {
              if (!obj || typeof obj !== 'object') return '';
              if (obj.play_addr?.url_list?.[0]) return obj.play_addr.url_list[0];
              if (obj.playAddr) return obj.playAddr;
              for (const k in obj) {
                  const r = deepSearch(obj[k]);
                  if (r) return r;
              }
              return '';
          };
          bestVideoUrl = deepSearch(item);
      }

      // Priority 3: Music-only as last resort (not recommended but for completeness)
      const musicUrl = item.music?.play_url?.url_list?.[0] || item.music?.play_url || item.music?.playUrl || '';

      const result: TiktokExtraction = {
        id: videoId,
        type: 'video', // We treat it as video if we find a playAddr
        video: bestVideoUrl,
        hdplay: bestVideoUrl,
        wmplay: bestVideoUrl,
        images: images,
        cover: videoObj.cover?.url_list?.[0] || videoObj.cover || '',
        caption: item.desc || item.share_info?.desc || '',
        author: item.author?.unique_id || item.author?.nickname || item.author?.uniqueId || '',
        music: musicUrl,
        userAgent: headers['User-Agent']
      };

      return { success: true, data: result };
    } catch (e: any) {
      logger.error(`API Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}
