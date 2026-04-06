import 'dotenv/config';
import postgres from 'postgres';

/**
 * Script ini digunakan untuk mereset seluruh database dengan cara menghapus SEMUA tabel.
 * HATI-HATI: Data akan hilang permanen!
 */
async function main() {
	console.log('🚀 Memulai proses reset database...');

	if (!process.env.DATABASE_URL) {
		console.error('❌ Error: DATABASE_URL tidak ditemukan di .env');
		process.exit(1);
	}

	const sql = postgres(process.env.DATABASE_URL, { prepare: false });

	try {
		// 1. Ambil daftar semua tabel di schema public
		const rows = await sql`
			SELECT tablename FROM pg_tables WHERE schemaname = 'public'
		`;
		const tables = rows.map((row) => row.tablename as string);

		if (tables.length === 0) {
			console.log('ℹ️ Tidak ada tabel yang ditemukan untuk dihapus.');
		} else {
			console.log(`🧹 Menghapus ${tables.length} tabel: ${tables.join(', ')}`);

			// 2. Drop semua tabel menggunakan CASCADE agar foreign key otomatis ikut terhapus
			for (const table of tables) {
				await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
				console.log(`   - Berhasil menghapus tabel: ${table}`);
			}
		}

		// 3. Drop semua custom enum types
		const enumRows = await sql`
			SELECT typname FROM pg_type
			WHERE typtype = 'e'
			AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
		`;

		if (enumRows.length > 0) {
			console.log(`🧹 Menghapus ${enumRows.length} enum types...`);
			for (const row of enumRows) {
				await sql.unsafe(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
				console.log(`   - Berhasil menghapus type: ${row.typname}`);
			}
		}

		console.log('\n✨ Database berhasil dikosongkan.');
	} catch (error) {
		console.error('❌ Terjadi kesalahan saat mereset database:', error);
	} finally {
		await sql.end();
		console.log('🔌 Koneksi database ditutup.');
	}
}

main();
