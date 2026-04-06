import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import type { db as DbType } from '$lib/server/database';
import {
	employees,
	users,
	shifts,
	companies,
	roles,
	presences
} from '$lib/server/database/schemas';
import { PresenceService } from './service';
import { eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

// Type for presence result
type PresenceResult = InferSelectModel<typeof presences>;

// Skip if NO DATABASE_URL
const runTests = process.env.DATABASE_URL ? describe : describe.skip;

runTests('PresenceService', () => {
	let testUserId: string;
	let testEmployeeId: string;
	let testShiftId: string;
	let presenceService: PresenceService;
	let db: typeof DbType;

	beforeAll(async () => {
		if (process.env.DATABASE_URL) {
			const database = await import('$lib/server/database');
			db = database.db;
		}

		presenceService = new PresenceService();

		// Get existing company
		const company = await db.select().from(companies).limit(1);
		const companyId = company[0]?.id;
		if (!companyId) throw new Error('No company found');

		// Get existing role
		const role = await db.select().from(roles).limit(1);
		const roleId = role[0]?.id;
		if (!roleId) throw new Error('No role found');

		// Create test shift (09:00 - 17:00)
		testShiftId = `test-shift-${Date.now()}`;
		await db.insert(shifts).values({
			id: testShiftId,
			name: 'Test Shift',
			startTime: '09:00',
			endTime: '17:00',
			companyId
		});

		// Create test user
		testUserId = crypto.randomUUID();
		await db.insert(users).values({
			id: testUserId,
			email: `test_presence_${Date.now()}@test.com`,
			name: 'Presence Test User',
			username: `presencetest${Date.now()}`,
			passwordHash: 'dummyhash',
			roleId
		});

		// Create test employee
		testEmployeeId = crypto.randomUUID();
		const fingerprint = `FP-TEST-${Date.now()}`;
		await db.insert(employees).values({
			id: testEmployeeId,
			userId: testUserId,
			companyId,
			idCard: fingerprint,
			joinDate: new Date(),
			status: 'permanent',
			shiftId: testShiftId
		});
	});

	beforeEach(async () => {
		// Clean up presences for test user to ensure clean state
		await db.delete(presences).where(eq(presences.userId, testUserId));
	});

	describe('clockIn', () => {
		it('should calculate late correctly when clocking in after shift start', async () => {
			const employee = await db
				.select()
				.from(employees)
				.where(eq(employees.id, testEmployeeId))
				.limit(1);
			const fingerprint = employee[0]?.idCard;
			if (!fingerprint) throw new Error('No fingerprint');

			// Simulate clock in at 09:30 (30 mins late)
			const clockInTime = new Date();
			clockInTime.setHours(9, 30, 0, 0);

			const result = (await presenceService.clockIn(fingerprint, clockInTime)) as PresenceResult;

			expect(result).toBeDefined();
			// Late should be around 30 mins
			expect(result.late).toBeGreaterThanOrEqual(25);
			expect(result.late).toBeLessThanOrEqual(35);
			expect(result.category).toBe('in');
		});

		it('should calculate overtime when clocking out after shift end', async () => {
			const employee = await db
				.select()
				.from(employees)
				.where(eq(employees.id, testEmployeeId))
				.limit(1);
			const fingerprint = employee[0]?.idCard;
			if (!fingerprint) throw new Error('No fingerprint');

			// Simulate clock in at 09:00 (On Time) first
			const clockInTime = new Date();
			clockInTime.setHours(9, 0, 0, 0);

			await db.insert(presences).values({
				id: crypto.randomUUID(),
				userId: testUserId,
				companyId: employee[0].companyId,
				fingerprint: fingerprint,
				time: clockInTime,
				category: 'in',
				type: 'online'
			});

			// Simulate clock out at 19:00 (2 hours overtime)
			const clockOutTime = new Date();
			clockOutTime.setHours(19, 0, 0, 0);

			const result = (await presenceService.clockIn(fingerprint, clockOutTime)) as PresenceResult;

			expect(result).toBeDefined();
			expect(result.overtime).toBeGreaterThanOrEqual(110);
			expect(result.overtime).toBeLessThanOrEqual(130);
			expect(result.category).toBe('out');
		});

		it('should not be late when clocking in on time', async () => {
			const employee = await db
				.select()
				.from(employees)
				.where(eq(employees.id, testEmployeeId))
				.limit(1);
			const fingerprint = employee[0]?.idCard;
			if (!fingerprint) throw new Error('No fingerprint');

			// Simulate clock in at 08:55 (5 mins early)
			const clockInTime = new Date();
			clockInTime.setHours(8, 55, 0, 0);

			const result = (await presenceService.clockIn(fingerprint, clockInTime)) as PresenceResult;

			expect(result).toBeDefined();
			expect(result.late).toBe(0);
			expect(result.category).toBe('in');
		});
	});

	describe('exportCsv', () => {
		it('should return valid CSV format', async () => {
			const csv = await presenceService.exportCsv({
				month: new Date().getMonth() + 1,
				year: new Date().getFullYear()
			});

			expect(csv).toBeDefined();
			expect(typeof csv).toBe('string');
			expect(csv).toContain('ID,Nama,Fingerprint');
			expect(csv.split('\n').length).toBeGreaterThan(1);
		});
	});
});
