import { db } from '../src/lib/server/database';
import { sql } from 'drizzle-orm';

async function main() {
	console.log('Adding overtime column manually...');
	try {
		await db.execute(sql`ALTER TABLE presences ADD COLUMN overtime INT DEFAULT 0 AFTER late`);
		console.log('Column overtime added.');
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		console.log('Error (maybe column exists):', msg);
	}
}

main();
