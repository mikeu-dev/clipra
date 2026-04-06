import { db } from '$lib/server/database';
import { tasks } from '$lib/server/database/schemas/tasks';
import { projects } from '$lib/server/database/schemas/projects';
import { users } from '$lib/server/database/schemas/users';
import { leaveRequests } from '$lib/server/database/schemas/leave-requests';
import { timesheets } from '$lib/server/database/schemas/timesheets';
import { schedules } from '$lib/server/database/schemas/schedules';
import { projectColumns } from '$lib/server/database/schemas/project-columns';
import { isNotNull, asc, eq, desc } from 'drizzle-orm';
import { env } from '$env/dynamic/public';
const PUBLIC_HOLIDAY_ICS_URL =
	env.PUBLIC_HOLIDAY_ICS_URL ||
	'https://calendar.google.com/calendar/ical/en.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';
import { randomUUID } from 'crypto';
import * as m from '$lib/paraglide/messages.js';

export const load = async () => {
	console.log('[Calendar] Load function started');
	try {
		// 1. Fetch Tasks
		const tasksQuery = db
			.select()
			.from(tasks)
			.leftJoin(projects, eq(tasks.projectId, projects.id))
			.leftJoin(users, eq(tasks.assignedTo, users.id))
			.leftJoin(projectColumns, eq(tasks.columnId, projectColumns.id))
			.where(isNotNull(tasks.deadline))
			.orderBy(asc(tasks.deadline));

		// 2. Fetch Leaves (Holidays/Time Off)
		const leavesQuery = db
			.select()
			.from(leaveRequests)
			.leftJoin(users, eq(leaveRequests.userId, users.id))
			.orderBy(desc(leaveRequests.startDate));

		// 3. Fetch Timesheets (Attendance)
		const timesheetsQuery = db
			.select()
			.from(timesheets)
			.leftJoin(users, eq(timesheets.userId, users.id))
			.leftJoin(projects, eq(timesheets.projectId, projects.id))
			.orderBy(desc(timesheets.date));

		// 4. Fetch Schedules (Agendas)
		const schedulesQuery = db
			.select()
			.from(schedules)
			.leftJoin(users, eq(schedules.userId, users.id))
			.orderBy(asc(schedules.startDate));

		console.log('[Calendar] Executing queries...');
		const [tasksData, leavesData, timesheetsData, schedulesData] = await Promise.all([
			tasksQuery,
			leavesQuery,
			timesheetsQuery,
			schedulesQuery
		]);
		console.log(
			`[Calendar] Queries complete. Tasks: ${tasksData.length}, Leaves: ${leavesData.length}, Timesheets: ${timesheetsData.length}, Schedules: ${schedulesData.length}`
		);

		// Normalize Tasks
		const taskEvents = tasksData.map((row) => ({
			id: row.tasks.id,
			type: 'task',
			title: row.tasks.title,
			date: row.tasks.deadline, // Date object or string potentially
			status: row.project_columns?.name || 'Unknown',
			priority: row.tasks.priority,
			description: row.tasks.description,
			project: row.projects ? { name: row.projects.name } : null,
			assignee: row.users ? { name: row.users.name } : null,
			isAllDay: true // Tasks are generally all-day markers in this view
		}));

		// Normalize Leaves
		const leaveEvents = leavesData.map((row) => ({
			id: row.leave_requests.id,
			type: 'leave',
			title: `Cuti: ${row.users?.name || 'Unknown'} (${row.leave_requests.type})`,
			date: row.leave_requests.startDate,
			endDate: row.leave_requests.endDate,
			status: row.leave_requests.status,
			description: row.leave_requests.reason,
			assignee: row.users ? { name: row.users.name } : null,
			isAllDay: true // Leaves are all-day
		}));

		// Normalize Timesheets
		const timesheetEvents = timesheetsData.map((row) => ({
			id: row.timesheets.id,
			type: 'timesheet',
			title: `Log: ${row.users?.name || 'Unknown'} - ${row.timesheets.hours}h`,
			date: row.timesheets.date,
			status: row.timesheets.status,
			description: row.timesheets.description,
			project: row.projects ? { name: row.projects.name } : null,
			assignee: row.users ? { name: row.users.name } : null,
			isAllDay: false // Timesheets have specific hours usually
		}));

		// Normalize Schedules (Agendas)
		const scheduleEvents = schedulesData.map((row) => ({
			id: row.schedules.id,
			type: 'schedule',
			title: row.schedules.title,
			date: row.schedules.startDate,
			endDate: row.schedules.endDate,
			status: row.schedules.location || 'Agenda', // Using status field to display location
			link: row.schedules.link,
			description: row.schedules.description,
			isAllDay: !!row.schedules.isAllDay,
			recurrence: row.schedules.recurrence,
			assignee: row.users ? { name: row.users.name } : null
		}));

		const events = [...taskEvents, ...leaveEvents, ...timesheetEvents, ...scheduleEvents];

		// 4. Fetch National Holidays (Indonesia) via Google Calendar ICS
		try {
			const currentYear = new Date().getFullYear();
			const response = await fetch(PUBLIC_HOLIDAY_ICS_URL);

			if (response.ok) {
				const icsData = await response.text();
				const lines = icsData.split(/\r?\n/);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const holidayEvents: any[] = [];
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				let currentEvent: any = {};

				for (const line of lines) {
					if (line.startsWith('BEGIN:VEVENT')) {
						currentEvent = {};
					} else if (line.startsWith('DTSTART;VALUE=DATE:')) {
						const d = line.split(':')[1];
						if (d && d.length >= 8) {
							currentEvent.date = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;
							currentEvent.year = parseInt(d.substring(0, 4), 10);
						}
					} else if (line.startsWith('SUMMARY:')) {
						currentEvent.name = line.substring(8);
					} else if (line.startsWith('END:VEVENT')) {
						// Ambil data tahun ini dan tahun depan agar kalender tidak kosong saat pindah tahun
						if (
							currentEvent.date &&
							currentEvent.name &&
							currentEvent.year >= currentYear &&
							currentEvent.year <= currentYear + 1
						) {
							holidayEvents.push({
								id: `holiday-${currentEvent.date}-${currentEvent.name.replace(/\s+/g, '-').substring(0, 20)}`,
								type: 'holiday' as const,
								title: currentEvent.name,
								date: currentEvent.date,
								status: 'Public Holiday',
								description: 'Libur Nasional',
								priority: 'medium' as const,
								project: null,
								assignee: null,
								isAllDay: true
							});
						}
					}
				}

				events.push(...holidayEvents);
				console.log(
					`[Calendar] Ditambahkan ${holidayEvents.length} data Libur Nasional dari Google Calendar.`
				);
			}
		} catch (holidayErr) {
			console.error('[Calendar] Failed to fetch holidays:', holidayErr);
			// Fail gracefully for external API issue
		}

		console.log(`[Calendar] Returning ${events.length} total events`);

		return {
			events
		};
	} catch (error) {
		console.error('[Calendar] Load error:', error);
		throw error;
	}
};

export const actions = {
	deleteEvent: async ({ request }) => {
		console.log('[Calendar] Action deleteEvent started');
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const type = formData.get('type')?.toString();

		if (!id || !type) {
			return { success: false, error: 'Invalid data provided' };
		}

		try {
			if (type === 'task') {
				await db.delete(tasks).where(eq(tasks.id, id));
			} else if (type === 'leave') {
				await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
			} else if (type === 'timesheet') {
				await db.delete(timesheets).where(eq(timesheets.id, id));
			} else if (type === 'schedule') {
				await db.delete(schedules).where(eq(schedules.id, id));
			} else {
				return { success: false, error: m.error_invalid_event_type_delete() };
			}
			console.log(`[Calendar] Event ${id} of type ${type} deleted successfully.`);
			return { success: true };
		} catch (error) {
			console.error(`[Calendar] Error deleting event ${id}:`, error);
			return { success: false, error: m.error_delete_event() };
		}
	},
	createSchedule: async ({ request, locals }) => {
		console.log('[Calendar] Action createSchedule started');
		const user = locals.user;
		if (!user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString();
		const location = formData.get('location')?.toString();
		const link = formData.get('link')?.toString();
		const startDateStr = formData.get('startDate')?.toString(); // YYYY-MM-DD
		const endDateStr = formData.get('endDate')?.toString(); // YYYY-MM-DD
		const startTime = formData.get('startTime')?.toString(); // HH:mm
		const endTime = formData.get('endTime')?.toString(); // HH:mm
		const isAllDay = formData.get('isAllDay') === 'on';
		const recurrence = formData.get('recurrence')?.toString() || 'none';

		if (!title || !startDateStr) {
			return { success: false, error: 'Judul dan Tanggal Mulai wajib diisi' };
		}

		try {
			const id = randomUUID();

			// Ensure local time parsing by appending T00:00:00 for all-day events
			let finalStart = new Date(`${startDateStr}T00:00:00`);
			if (!isAllDay && startTime) {
				finalStart = new Date(`${startDateStr}T${startTime}`);
			}

			let finalEnd = endDateStr ? new Date(`${endDateStr}T00:00:00`) : null;
			if (!isAllDay && endTime && endDateStr) {
				finalEnd = new Date(`${endDateStr}T${endTime}`);
			} else if (!isAllDay && endTime && !endDateStr) {
				// If no end date, use start date with end time
				finalEnd = new Date(`${startDateStr}T${endTime}`);
			}

			await db.insert(schedules).values({
				id,
				userId: user.id,
				title,
				description: description || null,
				location: location || null,
				link: link || null,
				isAllDay,
				recurrence,
				startDate: finalStart,
				endDate: finalEnd
			});
			console.log(`[Calendar] DB Insert Success: ${id}`, { title, finalStart, finalEnd, isAllDay });
			console.log(`[Calendar] Schedule ${id} created successfully.`);
			return { success: true };
		} catch (error) {
			console.error('[Calendar] Error creating schedule:', error);
			return { success: false, error: m.error_create_schedule() };
		}
	},
	updateScheduleDate: async ({ request, locals }) => {
		console.log('[Calendar] Action updateScheduleDate started');
		const user = locals.user;
		if (!user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const type = formData.get('type')?.toString();
		const newDateStr = formData.get('newDate')?.toString();

		if (!id || !newDateStr || !type) {
			return { success: false, error: 'Data drag-and-drop tidak lengkap' };
		}

		try {
			const newDate = new Date(`${newDateStr}T00:00:00`);

			if (type === 'schedule') {
				// Pastikan user hanya bisa mengubah jadwalnya sendiri atau ada check izin
				const existing = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
				if (!existing.length || existing[0].userId !== user.id) {
					return { success: false, error: 'Anda tidak diizinkan memindahkan jadwal ini' };
				}

				// Jika schedule punya endDate, kita perlu menggesernya dengan durasi yang sama
				let newEndDate = existing[0].endDate;
				if (existing[0].endDate && existing[0].startDate) {
					const duration = existing[0].endDate.getTime() - existing[0].startDate.getTime();
					newEndDate = new Date(newDate.getTime() + duration);
				}

				await db
					.update(schedules)
					.set({ startDate: newDate, endDate: newEndDate })
					.where(eq(schedules.id, id));
				console.log(`[Calendar] Schedule ${id} moved to ${newDateStr}`);
			} else if (type === 'task') {
				// Memindahkan deadline task
				await db.update(tasks).set({ deadline: newDate }).where(eq(tasks.id, id));
				console.log(`[Calendar] Task ${id} deadline moved to ${newDateStr}`);
			} else {
				return { success: false, error: 'Tipe acara tidak mendukung drag-and-drop ini' };
			}

			return { success: true };
		} catch (error) {
			console.error(`[Calendar] Error updating date for ${id}:`, error);
			return { success: false, error: m.error_update_event_date() };
		}
	}
};
