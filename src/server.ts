import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import scrapeRouter from './routes/scrape.route';
import { handleError } from './utils/error';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Basic protection for public API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/scrape', limiter);

// Routes
app.use('/scrape', scrapeRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  handleError(err, res);
});

// Start Server
app.listen(port, () => {
  logger.info(`⚡️[server]: Clipra Scraper Engine is running at http://localhost:${port}`);
});

export default app;
