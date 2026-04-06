import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas/index';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

let client: postgres.Sql;
let db: PostgresJsDatabase<typeof schema>;
let testConnectionInternal: () => Promise<void> = async () => {};

if (!DATABASE_URL) {
	console.warn('[WARN] DATABASE_URL is not set. Database functionality will be disabled.');

	// Create a dummy client that throws on access
	const dummyHandler = {
		get: () => () => {
			throw new Error('Database is not initialized. DATABASE_URL is missing.');
		}
	};
	client = new Proxy({}, dummyHandler) as unknown as postgres.Sql;
	db = new Proxy({}, dummyHandler) as unknown as PostgresJsDatabase<typeof schema>;
} else {
	// Disable prefetch as it is not supported for "Transaction" pool mode
	client = postgres(DATABASE_URL, {
		prepare: false,
		max: 10,
		idle_timeout: 60,
		connect_timeout: 10
	});

	// Connection test moved to a dedicated function to avoid side-effects during build
	testConnectionInternal = async () => {
		try {
			await client`SELECT 1`;
			console.log('[SUCCESS] Database connected successfully');
		} catch (err) {
			console.error('[ERROR] Database connection failed:', err);
			console.warn('[WARN] Aplikasi akan tetap berjalan tanpa koneksi database aktif.');
		}
	};

	db = drizzle(client, { schema });
}

export const testConnection = testConnectionInternal;
export { db, client as dbPool };
