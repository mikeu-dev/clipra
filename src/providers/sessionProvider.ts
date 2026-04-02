import fs from 'fs';
import path from 'path';
import { Page } from 'puppeteer';
import logger from '../utils/logger';

export interface TiktokSession {
  cookies: string;
  userAgent: string;
  updatedAt: number;
}

const SESSION_FILE = path.join(process.cwd(), '.session.json');

export class SessionProvider {
  private static session: TiktokSession | null = null;
  private static initialized: boolean = false;

  /**
   * Memastikan sesi dimuat dari disk jika tersedia
   */
  private static ensureInitialized() {
    if (this.initialized) return;
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const content = fs.readFileSync(SESSION_FILE, 'utf-8');
        this.session = JSON.parse(content);
        logger.info('Loaded existing Tiktok session from disk.');
      }
    } catch (e: any) {
      logger.warn(`Failed to load session from disk: ${e.message}`);
    }
    this.initialized = true;
  }

  /**
   * Captures the session from a puppeteer page and saves it to disk
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

      // Save to disk
      try {
        fs.writeFileSync(SESSION_FILE, JSON.stringify(this.session, null, 2));
        logger.info('Tiktok session captured and saved to disk.');
      } catch (saveError: any) {
        logger.error(`Failed to save session to disk: ${saveError.message}`);
      }

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
    this.ensureInitialized();
    // Perpanjang validitas sesi menjadi 24 jam
    if (this.session && (Date.now() - this.session.updatedAt < 86400000)) {
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

