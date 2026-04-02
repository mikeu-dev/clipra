import { Response } from 'express';
import logger from './logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err: any, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(err.message, { stack: err.stack, isOperational: err.isOperational });

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
