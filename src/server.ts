import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import scrapeRouter from './routes/scrape.route';
import { handleError } from './utils/error';
import logger from './utils/logger';
import { env } from './utils/env';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clipra Scraper Engine API',
      version: '1.0.0',
      description: 'Advanced TikTok Data Provider API',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app: Express = express();
const port = env.PORT;

// Security Middleware
app.use(helmet());
app.use(cors());

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// Home / Welcome
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to Clipra Scraper Engine API',
    endpoints: {
      scrape: '/scrape?url=[TIKTOK_URL]',
      api_docs: '/api-docs',
      health: '/health'
    },
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

let server: any;

// Start Server (Only if not on Vercel)
if (!process.env.VERCEL) {
  server = app.listen(port, () => {
    logger.info(`⚡️[server]: Clipra Scraper Engine is running at http://localhost:${port} in ${env.NODE_ENV} mode`);
  });
}

// Graceful Shutdown (Only for non-serverless)
const gracefulShutdown = () => {
  if (server) {
    logger.info('Received shutdown signal. Closing server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    
    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

if (!process.env.VERCEL) {
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

export default app;
