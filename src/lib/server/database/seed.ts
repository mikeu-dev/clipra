import 'dotenv/config';
import { dbPool } from './index';

import {
	seedRoles,
	seedUsers,
	seedSettings,
	seedBanks,
	seedPositions,
	seedReligions,
	seedSchools,
	seedShifts,
	seedStages,
	seedUnits,
	seedClients,
	seedPermissions,
	seedServices,
	seedTeams,
	// seedJobs,
	seedCompanies,
	seedEmployees,
	seedPresences,
	seedSalaryComponents
} from './seeds/index';

// ... imports

// Fungsi bantu untuk menghapus semua data
// async function clearDatabase() {
// 	console.log('[CLEAN] Mengosongkan seluruh data database...');
//
// 	try {
// 		await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
//
// 		const tables = [
// 			table.sessions,
// 			table.userProfiles, // Added missing table
// 			table.users,
// 			table.rolePermissions,
// 			table.permissions,
// 			table.roles,
// 			table.settings,
// 			table.banks,
// 			table.positions,
// 			table.religions,
// 			table.schools,
// 			table.shifts,
// 			table.stages,
// 			table.units,
// 			table.clients,
// 			table.documents,
// 			table.projects,
// 			table.projectUsers,
// 			table.tasks,
// 			table.comments,
// 			table.activityLogs,
// 			table.notifications,
// 			table.pushSubscriptions,
// 			table.attachments,
// 			table.contacts,
// 			table.newsletterSubscriptions,
// 			table.jobs,
// 			table.jobApplicants,
// 			table.invoices,
// 			table.invoiceItems,
// 			table.invoicePayments,
// 			table.expenses,
// 			table.timesheets,
// 			table.leaveRequests,
// 			table.services,
// 			table.tags,
// 			table.taggables
// 		];
//
// 		for (const t of tables) {
// 			await db.delete(t);
// 		}
// 	} finally {
// 		await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
// 	}
//
// 	console.log('[SUCCESS] Semua tabel berhasil dikosongkan.');
// }

// Fungsi utama seeding
async function seed() {
	console.log('[SEED] Memulai proses seeding...\n');

	try {
		// await clearDatabase(); // DICOBA UNTUK TIDAK MENGHAPUS DATA
		// 1. Core Structure & Auth
		await seedCompanies(); // Must be first to establish the main company
		await seedRoles();
		await seedPermissions(); // Before users, after roles

		// 2. Master Data
		await seedBanks();
		await seedReligions();
		await seedPositions(); // Depends on Company (Company must exist)
		await seedSchools();
		await seedShifts();
		await seedStages();
		await seedUnits();
		await seedSettings();
		await seedSalaryComponents();

		// 3. User Data & Structure
		await seedTeams(); // Creates Users & Profiles (and positions if missing)
		await seedUsers(); // seedTeams likely covers the main users, but keeping this if needed for extra users

		// 4. Operational Data (Dependent on Users & Master Data)
		await seedEmployees(); // Depends on Users, Company, Positions, Shifts
		await seedPresences(); // Depends on Employees

		// 5. Features / Content
		await seedServices(); // Depends on Company
		await seedClients(); // Depends on Company
		// await seedJobs();
		// await seedPages();

		console.log('\n[DONE] Semua seeding selesai tanpa error!');
		process.exitCode = 0;
	} finally {
		// Tutup koneksi DB jika tersedia
		try {
			if (dbPool) await dbPool.end();
			console.log('[DB] Koneksi database ditutup.');
		} catch (e) {
			console.warn('[WARN] Gagal menutup koneksi database:', e);
		}
	}
}

// Jalankan hanya jika file dieksekusi langsung
if (import.meta.url === `file://${process.argv[1]}`) {
	seed();
}
