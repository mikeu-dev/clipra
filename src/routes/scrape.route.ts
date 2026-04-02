import { Router } from 'express';
import { ScrapeController } from '../controllers/scrape.controller';

const router = Router();

router.get('/', ScrapeController.handleScrapeRequest);

export default router;
