import winston from 'winston';
import { dev } from '$app/environment';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Format kustom untuk development agar mudah dibaca manusia
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
	const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
	// Jika ada stack trace (error), tampilkan juga
	const logMessage = stack || message;
	return `${timestamp} [${level}]: ${logMessage} ${metaString}`;
});

export const logger = winston.createLogger({
	level: dev ? 'debug' : 'info',
	format: combine(
		timestamp(),
		errors({ stack: true }), // Tangkap stack trace jika error
		dev ? combine(colorize(), devFormat) : json() // JSON di prod, readable di dev
	),
	transports: [new winston.transports.Console()]
});

// Add file transport in production
if (!dev) {
	logger.add(
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error'
		})
	);
	logger.add(
		new winston.transports.File({
			filename: 'logs/combined.log'
		})
	);
}
