import type * as table from '$lib/server/database/schemas';
import { BaseService } from '../../core/base.service';
import type { PresenceRepository } from './repository';
import { PresenceRepository as PresenceRepositoryImpl } from './repository';
import { PresenceMapper } from './mapper';
import * as m from '$lib/paraglide/messages.js';

// Define Interface if strict typing needed, for now use standard
// import type { IPresenceService } from './interfaces/IPresenceService';

export class PresenceService extends BaseService<table.Presence, table.NewPresence, unknown> {
	protected override repository: PresenceRepository;
	protected mapper: PresenceMapper;

	constructor(companyId?: string) {
		const repository = new PresenceRepositoryImpl(companyId);
		const mapper = new PresenceMapper();
		super(repository, mapper);
		this.repository = repository;
		this.mapper = mapper;
	}

	// Custom method: user clock-in
	async clockIn(fingerprint: string, timeInput?: Date) {
		const { db } = await import('$lib/server/database');
		const { eq, and, gte, lte } = await import('drizzle-orm');
		const { employees, shifts, shiftSchedules } = await import('$lib/server/database/schemas');

		const time = timeInput || new Date();
		const dayOfWeek = time.getDay().toString(); // 0-6

		// Find employee, shift, and specific daily schedule
		const employeeData = await db
			.select({
				employee: employees,
				shift: shifts,
				schedule: shiftSchedules
			})
			.from(employees)
			.leftJoin(shifts, eq(employees.shiftId, shifts.id))
			.leftJoin(
				shiftSchedules,
				and(
					eq(shiftSchedules.shiftId, shifts.id),
					eq(shiftSchedules.day, dayOfWeek as '0' | '1' | '2' | '3' | '4' | '5' | '6')
				)
			)
			.where(eq(employees.idCard, fingerprint))
			.limit(1);

		let lateMatches = 0;
		let overtimeMatches = 0;

		if (employeeData.length > 0) {
			const { shift, schedule } = employeeData[0];

			// Prioritize Daily Schedule > Default Shift
			const startTimeStr = schedule?.startTime || shift?.startTime;
			const endTimeStr = schedule?.endTime || shift?.endTime;

			if (startTimeStr && endTimeStr) {
				const [startHour, startMinute] = startTimeStr.split(':').map(Number);
				const [endHour, endMinute] = endTimeStr.split(':').map(Number);

				// Shift Start Time Object
				const shiftStart = new Date(time);
				shiftStart.setHours(startHour, startMinute, 0, 0);

				// Shift End Time Object
				const shiftEnd = new Date(time);
				shiftEnd.setHours(endHour, endMinute, 0, 0);

				// Logic IN (Masuk) -> Calculate Late
				// Ideally we should know if this is Check In or Check Out event.
				// However, existing logic seems to hardcode category='in' later?
				// We should probably check existing presence for today to decide IN/OUT or use input category.
				// For now, let's assume if before middle of shift -> IN, after -> OUT?
				// Or better: check if 'in' exists for today.

				// --- Simple Logic for this step: Calculate basic diffs relative to shift ---

				// 1. Calculate Late (diff > 0 relative to Start)
				const diffStart = time.getTime() - shiftStart.getTime();
				if (diffStart > 0) {
					lateMatches = Math.ceil(diffStart / (1000 * 60));
					// Cap late at 0 if actually overtime (clocks in way after shift end? unlikely for normal late)
				}

				// 2. Calculate Overtime (diff > 0 relative to End)
				const diffEnd = time.getTime() - shiftEnd.getTime();
				if (diffEnd > 0) {
					overtimeMatches = Math.ceil(diffEnd / (1000 * 60));
				}
			}
		}

		// Determine Category (IN/OUT) based on time relative to shift?
		// Or check if already clocked in?
		// Existing code hardcoded 'in'. Let's improve:
		// If time is closer to StartTime force IN, if closer to EndTime force OUT?
		// Or check DB.

		// SMART LOGIC: Check existing presence for today
		const startOfDay = new Date(time);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(time);
		endOfDay.setHours(23, 59, 59, 999);

		// Get Employee's User ID
		let userId = '';
		if (employeeData.length > 0) {
			userId = employeeData[0].employee.userId;
		} else {
			// Fallback: Need to find employee by fingerprint if not found above (e.g. no shift assigned)
			const emp = await db
				.select()
				.from(employees)
				.where(eq(employees.idCard, fingerprint))
				.limit(1);
			if (emp.length > 0) userId = emp[0].userId;
		}

		let category: 'in' | 'out' = 'in';
		let earlierMatches = 0;

		if (userId) {
			// Find latest presence for today
			const { presences } = await import('$lib/server/database/schemas');
			const { desc } = await import('drizzle-orm');

			const dailyPresences = await db
				.select()
				.from(presences)
				.where(
					and(
						eq(presences.userId, userId),
						gte(presences.time, startOfDay),
						lte(presences.time, endOfDay)
					)
				)
				.orderBy(desc(presences.time))
				.limit(1);

			// Toggle Logic
			if (dailyPresences.length > 0 && dailyPresences[0].category === 'in') {
				category = 'out';
			} else {
				category = 'in';
			}
		}

		// recalculate metrics based on determined category
		if (category === 'in') {
			overtimeMatches = 0;
			// lateMatches already calculated above if shift exists
		} else {
			lateMatches = 0;
			// Calculate Early Departure (Pulang Awal)
			if (employeeData.length > 0) {
				const { shift, schedule } = employeeData[0];
				const endTimeStr = schedule?.endTime || shift?.endTime;
				if (endTimeStr) {
					const [endHour, endMinute] = endTimeStr.split(':').map(Number);
					const shiftEnd = new Date(time);
					shiftEnd.setHours(endHour, endMinute, 0, 0);

					const diffEarly = shiftEnd.getTime() - time.getTime();
					if (diffEarly > 0) {
						earlierMatches = Math.ceil(diffEarly / (1000 * 60));
						// If early, logic says no overtime
						overtimeMatches = 0;
					}
				}
			}
		}

		return this.create({
			fingerprint: fingerprint,
			time: time,
			category: category,
			late: lateMatches, // Only valid if IN
			overtime: overtimeMatches, // Only valid if OUT
			earlier: earlierMatches,
			type: 'online'
		} as Parameters<typeof this.create>[0]);
	}

	async getPaginated(
		page: number = 1,
		limit: number = 10,
		filters?: { month?: number; year?: number; search?: string }
	) {
		return this.repository.findPaginated(page, limit, filters);
	}

	async exportCsv(filters?: { month?: number; year?: number }) {
		const { db } = await import('$lib/server/database');
		const { presences, users } = await import('$lib/server/database/schemas');
		const { eq, and, gte, lte, isNull } = await import('drizzle-orm');

		// Build where conditions
		const conditions = [isNull(presences.deletedAt)];

		if (filters?.month && filters?.year) {
			const startDate = new Date(filters.year, filters.month - 1, 1);
			const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
			conditions.push(gte(presences.time, startDate));
			conditions.push(lte(presences.time, endDate));
		}

		const data = await db
			.select({
				id: presences.id,
				fingerprint: presences.fingerprint,
				time: presences.time,
				category: presences.category,
				late: presences.late,
				overtime: presences.overtime,
				earlier: presences.earlier,
				type: presences.type,
				userName: users.name
			})
			.from(presences)
			.leftJoin(users, eq(presences.userId, users.id))
			.where(and(...conditions));

		// Generate CSV
		let csv = `${m.export_csv_id()},${m.export_csv_name()},${m.export_csv_fingerprint()},${m.export_csv_time()},${m.export_csv_category()},${m.export_csv_late()},${m.export_csv_overtime()},${m.export_csv_early_leave()},${m.export_csv_type()}\n`;

		for (const row of data) {
			const time = row.time ? new Date(row.time).toLocaleString('id-ID') : '-';
			csv += `"${row.id}","${row.userName || '-'}","${row.fingerprint || '-'}","${time}","${row.category}","${row.late || 0}","${row.overtime || 0}","${row.earlier || 0}","${row.type}"\n`;
		}

		return csv;
	}
}
