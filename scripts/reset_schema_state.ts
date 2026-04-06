import 'dotenv/config';
import postgres from 'postgres';

async function main() {
	console.log('Resetting schema state...');
	const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

	// Drop tables if they exist
	const tables = ['employee_salaries', 'employees', 'companies'];
	for (const table of tables) {
		try {
			await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
			console.log(`Dropped ${table}`);
		} catch (e) {
			console.log(`Error dropping ${table}:`, e);
		}
	}

	// Drop columns from positions and shifts if they exist
	const alterTables = ['positions', 'shifts'];
	for (const table of alterTables) {
		try {
			await sql.unsafe(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS company_id`);
			console.log(`Dropped company_id from ${table}`);
		} catch (e: unknown) {
			const err = e as { message?: string };
			console.log(`Error altering ${table}:`, err.message);
		}
	}

	await sql.end();
}

main();
