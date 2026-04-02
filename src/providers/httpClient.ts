import axios, { AxiosInstance } from 'axios';

export class HttpClient {
  private client: AxiosInstance;

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
  ];

  constructor() {
    this.client = axios.create({
      timeout: 10000,
    });

    // Request interceptor to randomize user agents and inject realistic headers
    this.client.interceptors.request.use((config) => {
      const randomUa = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      config.headers['User-Agent'] = randomUa;
      config.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
      config.headers['Accept-Language'] = 'en-US,en;q=0.9';
      config.headers['Sec-Ch-Ua'] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"';
      config.headers['Sec-Ch-Ua-Mobile'] = randomUa.includes('iPhone') ? '?1' : '?0';
      config.headers['Sec-Ch-Ua-Platform'] = randomUa.includes('Macintosh') ? '"macOS"' : randomUa.includes('iPhone') ? '"iOS"' : '"Windows"';
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
