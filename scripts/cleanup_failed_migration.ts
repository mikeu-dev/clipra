import 'dotenv/config';
import postgres from 'postgres';

async function main() {
	console.log('Cleaning up failed migration tables...');
	const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

	// Drop in reverse order of dependency (CASCADE handles FK deps)
	const tables = ['employee_salaries', 'employees', 'companies'];

	for (const table of tables) {
		try {
			await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
			console.log(`Dropped ${table}`);
		} catch (e) {
			console.log(`Error dropping ${table}`, e);
		}
	}

	await sql.end();
	console.log('Cleanup complete.');
}

main();
