import dotenv from 'dotenv';
import path from 'path';

console.log('[Setup] Loading environment variables from:', path.resolve(process.cwd(), '.env'));
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (result.error) {
	console.error('[Setup] Error loading .env:', result.error);
} else {
	console.log('[Setup] .env loaded successfully.');
}

if (!process.env.DATABASE_URL) {
	console.error('[Setup] WARNING: DATABASE_URL is NOT set after loading .env!');
} else {
	console.log('[Setup] DATABASE_URL is set.');
}
