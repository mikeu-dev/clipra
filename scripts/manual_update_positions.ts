import { db } from '../src/lib/server/database';
import { sql } from 'drizzle-orm';

async function main() {
	console.log('🔄 Running manual migration for positions table...');
	try {
		await db.execute(sql`ALTER TABLE positions ADD COLUMN base_salary decimal(15,2) DEFAULT '0'`);
		console.log('✅ Successfully added base_salary to positions table.');
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes('Duplicate column name')) {
			console.log('⚠️ Column base_salary already exists. Skipping.');
		} else {
			console.error('❌ Error executing migration:', e);
			process.exit(1);
		}
	}
	process.exit(0);
}

main();
