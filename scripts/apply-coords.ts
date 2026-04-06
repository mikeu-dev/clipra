import 'dotenv/config';
import postgres from 'postgres';

async function run() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');

	const sql = postgres(url, { prepare: false });

	console.log('Connected to database. Applying schema changes...');

	const statements = [
		'ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "latitude" decimal(10,8)',
		'ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "longitude" decimal(11,8)',
		'ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "latitude" decimal(10,8)',
		'ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "longitude" decimal(11,8)',
		'ALTER TABLE "inventory_warehouses" ADD COLUMN IF NOT EXISTS "latitude" decimal(10,8)',
		'ALTER TABLE "inventory_warehouses" ADD COLUMN IF NOT EXISTS "longitude" decimal(11,8)',
		'ALTER TABLE "inventory_products" ADD COLUMN IF NOT EXISTS "unit" varchar(50)',
		'ALTER TABLE "inventory_products" ADD COLUMN IF NOT EXISTS "brand" varchar(100)'
	];

	for (const stmt of statements) {
		try {
			console.log(`Executing: ${stmt}`);
			await sql.unsafe(stmt);
			console.log('Success.');
		} catch (error) {
			const err = error as { code?: string; message?: string };
			if (err.code === '42701') {
				// 42701 = duplicate_column in PG
				console.log('Column already exists, skipping.');
			} else {
				console.warn(`Warning/Error executing ${stmt}:`, err.message);
			}
		}
	}

	await sql.end();
	console.log('Done.');
}

run().catch(console.error);
