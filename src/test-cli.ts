import { EngineService } from './services/engine.service';
import logger from './utils/logger';

async function run() {
  const url = process.argv[2];
  if (!url) {
    console.error('\n❌ Error: Harap sediakan URL TikTok.');
    console.log('Contoh: npx ts-node src/test-cli.ts "https://vt.tiktok.com/ZS..."\n');
    process.exit(1);
  }

  console.log('\n🚀 Starting Clipra Scraper Engine (CLI Mode)');
  console.log(`🔗 Target URL: ${url}\n`);
  
  const engine = new EngineService();
  const startTime = Date.now();
  
  try {
    const result = await engine.extract(url);
    const duration = (Date.now() - startTime) / 1000;
    
    if (result.success && result.data) {
      console.log('\n✅ EXTRACTION SUCCESSFUL');
      console.log('-----------------------------------');
      console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);
      console.log(`📦 Layer: ${result.layer}`);
      console.log(`👤 Author: ${result.data.author}`);
      console.log(`📝 Caption: ${result.data.caption.substring(0, 50)}${result.data.caption.length > 50 ? '...' : ''}`);
      console.log(`🎥 Type: ${result.data.type.toUpperCase()}`);
      
      if (result.data.type === 'video') {
        console.log(`🔗 Video: ${result.data.video?.substring(0, 80)}...`);
      } else if (result.data.images) {
        console.log(`🖼️ Images: ${result.data.images.length} items`);
      }
      console.log('-----------------------------------\n');
    } else {
      console.log('\n❌ EXTRACTION FAILED');
      console.log('-----------------------------------');
      console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);
      console.log(`⚠️ Error: ${result.error}`);
      console.log(`📍 Layer: ${result.layer}`);
      console.log('-----------------------------------\n');
    }
  } catch (err: any) {
    logger.error(`Fatal CLI Error: ${err.message}`);
  }

  // Exit process forcefully because Puppeteer pool might hold event loop
  setTimeout(() => process.exit(0), 1000);
}

run();
