import { Page } from 'puppeteer';
import logger from '../utils/logger';

export interface TiktokSession {
  cookies: string;
  userAgent: string;
  updatedAt: number;
}

export class SessionProvider {
  private static session: TiktokSession | null = null;

  /**
   * Captures the session from a puppeteer page
   */
  public static async captureFromPage(page: Page): Promise<TiktokSession | null> {
    try {
      const cookies = await page.cookies();
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const ua = await page.evaluate(() => navigator.userAgent);

      this.session = {
        cookies: cookieString,
        userAgent: ua,
        updatedAt: Date.now()
      };

      logger.info('Tiktok session captured and stored in memory.');
      return this.session;
    } catch (e: any) {
      logger.error(`Failed to capture session: ${e.message}`);
      return null;
    }
  }

  /**
   * Returns the currently stored session
   */
  public static getSession(): TiktokSession | null {
    // Session is valid for 1 hour for now
    if (this.session && (Date.now() - this.session.updatedAt < 3600000)) {
      return this.session;
    }
    return null;
  }

  /**
   * Applies the session to an Axios config or headers object
   */
  public static applyToHeaders(headers: any) {
    const session = this.getSession();
    if (session) {
      headers['Cookie'] = session.cookies;
      headers['User-Agent'] = session.userAgent;
    }
  }
}
