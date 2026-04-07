import axios, { AxiosInstance } from 'axios';
import http from 'http';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { env } from '../utils/env';
import logger from '../utils/logger';

export class HttpClient {
  public client: AxiosInstance;

  public static readonly DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  public static readonly MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
  
  private userAgents = [
    HttpClient.DEFAULT_UA,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  ];

  constructor() {
    const proxyUrl = env.PROXY_URL;
    
    // Configure Persistent Connections (Keep-Alive)
    const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
    const httpsAgent = proxyUrl 
      ? new HttpsProxyAgent(proxyUrl) 
      : new https.Agent({ keepAlive: true, maxSockets: 100 });

    if (proxyUrl) {
      logger.info('HttpClient initialized with Proxy support.');
    } else {
      logger.info('HttpClient initialized with Keep-Alive support.');
    }

    this.client = axios.create({
      timeout: 10000, // Reduced from 15s to 10s for better responsiveness
      httpAgent: httpAgent,
      httpsAgent: httpsAgent,
      proxy: false,
    });

    // Request interceptor to use a random User-Agent and inject realistic headers
    this.client.interceptors.request.use((config) => {
      const ua = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      config.headers['User-Agent'] = ua;
      config.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
      config.headers['Accept-Language'] = 'en-US,en;q=0.9,id;q=0.8';
      
      if (ua.includes('Chrome')) {
        config.headers['Sec-Ch-Ua'] = '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"';
        config.headers['Sec-Ch-Ua-Mobile'] = ua.includes('iPhone') || ua.includes('iPad') ? '?1' : '?0';
        config.headers['Sec-Ch-Ua-Platform'] = ua.includes('Macintosh') ? '"macOS"' : 
                                               ua.includes('iPhone') || ua.includes('iPad') ? '"iOS"' : 
                                               ua.includes('Linux') ? '"Linux"' : '"Windows"';
      }

      config.headers['Sec-Fetch-Dest'] = 'document';
      config.headers['Sec-Fetch-Mode'] = 'navigate';
      config.headers['Sec-Fetch-Site'] = 'none';
      config.headers['Sec-Fetch-User'] = '?1';
      config.headers['Upgrade-Insecure-Requests'] = '1';

      return config;
    });
  }


  public async getHtml(url: string): Promise<string> {
    const response = await this.client.get(url);
    return response.data;
  }
}

export default new HttpClient();
