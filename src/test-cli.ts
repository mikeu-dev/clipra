import { EngineService } from './services/engine.service';
import logger from './utils/logger';

async function run() {
  const url = process.argv[2];
  if (!url) {
    console.error('Harap sediakan URL TikTok. Contoh: ts-node src/test-cli.ts "https://vt.tiktok.com/ZS..."');
    process.exit(1);
  }

  logger.info(`Memulai ekstraksi data untuk URL: ${url}`);
  
  const engine = new EngineService();
  const startTime = Date.now();
  
  const result = await engine.extract(url);
  
  const duration = Date.now() - startTime;
  
  logger.info(`Proses Selesai. Durasi: ${duration}ms`);
  logger.info(`Layer Berhasil: ${result.layer || 'None'}`);
  
  console.log(JSON.stringify(result, null, 2));

  // Exit process forcefully because Puppeteer pool might hold event loop
  process.exit(0);
}

run();
