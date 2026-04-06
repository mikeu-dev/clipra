import { db } from '../src/lib/server/database';
import { sql } from 'drizzle-orm';

async function main() {
	console.log('Checking shifts table...');
	try {
		// Try to add the columns. If they exist, it might error, so we wrap in try/catch or just execute and see.
		// MySQL IF NOT EXISTS for column is not standard in generic ALTER TABLE, usually specific syntax or just catch error.

		console.log('Adding start_time column...');
		try {
			await db.execute(
				sql`ALTER TABLE \`shifts\` ADD \`start_time\` time DEFAULT '09:00:00' NOT NULL`
			);
			console.log('start_time added.');
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			console.log('start_time might already exist or error:', msg);
		}

		console.log('Adding end_time column...');
		try {
			await db.execute(
				sql`ALTER TABLE \`shifts\` ADD \`end_time\` time DEFAULT '17:00:00' NOT NULL`
			);
			console.log('end_time added.');
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			console.log('end_time might already exist or error:', msg);
		}

		process.exit(0);
	} catch (e) {
		console.error('Script failed:', e);
		process.exit(1);
	}
}

main();
