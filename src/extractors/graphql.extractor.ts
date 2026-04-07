import { BrowserProvider } from '../providers/browserPool';
import httpClient from '../providers/httpClient';
import { ExtractionResult, TiktokExtraction } from '../types';
import { Helpers } from '../utils/helpers';
import logger from '../utils/logger';

export class GraphqlExtractor {
  /**
   * Layer 2: Web GraphQL API Extractor
   */
  public async extract(url: string): Promise<ExtractionResult> {
    try {
      let videoId = Helpers.extractVideoId(url);
      if (!videoId) return { success: false, error: 'Invalid Video ID' };

      logger.info(`[GraphQL] Starting extraction for ID: ${videoId}`);

      // 1. Get REAL Tokens from Signer Service
      const paramsBeforeSign = new URLSearchParams({
        itemId: videoId,
        aid: '1988', 
        app_name: 'tiktok_web',
        device_id: '7300000000000000000'
      });
      const baseUrl = `https://www.tiktok.com/api/item/detail/?${paramsBeforeSign.toString()}`;
      
      logger.info(`[GraphQL] Fetching real signature for URL...`);
      const { xBogus, msToken, ttwid } = await BrowserProvider.signUrl(baseUrl);

      if (!xBogus) {
          logger.warn('[GraphQL] Failed to generate X-Bogus, API might reject request.');
      }

      // 2. Perform Signed GraphQL Request
      const finalParams = new URLSearchParams(paramsBeforeSign);
      finalParams.append('msToken', msToken);
      finalParams.append('X-Bogus', xBogus);

      const apiUrl = `https://www.tiktok.com/api/item/detail/?${finalParams.toString()}`;
      
      const response = await httpClient.client.get(apiUrl, {
        headers: {
          'Referer': 'https://www.tiktok.com/',
          'Accept': 'application/json, text/plain, */*',
          'Cookie': `msToken=${msToken}; ttwid=${ttwid};`
        }
      });

      const item = response.data?.itemInfo?.itemStruct || response.data?.itemStruct;
      
      if (!item) {
        return { success: false, error: 'GraphQL API returned no item info' };
      }

      const videoObj = item.video || {};
      const result: TiktokExtraction = {
        id: videoId,
        type: 'video',
        video: videoObj.playAddr || videoObj.downloadAddr || '',
        hdplay: videoObj.playAddr || '',
        wmplay: videoObj.downloadAddr || '',
        images: item.imagePost?.images?.map((img: any) => img.displayAddr || img.display_addr?.url_list?.[0]) || [],
        cover: videoObj.cover || '',
        caption: item.desc || '',
        author: item.author?.uniqueId || item.author?.nickname || '',
        music: item.music?.playUrl || item.music?.play_url?.url_list?.[0] || '',
      };

      return { success: true, data: result };

    } catch (e: any) {
      logger.error(`[GraphQL] Extraction Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}
