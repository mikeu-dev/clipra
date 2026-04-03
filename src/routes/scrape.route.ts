import { Router } from 'express';
import { ScrapeController } from '../controllers/scrape.controller';

const router = Router();

router.get('/', ScrapeController.handleScrapeRequest);
router.post('/v1', ScrapeController.handleTikwmCompatibility);
router.get('/v1', ScrapeController.handleTikwmCompatibility);

export default router;
