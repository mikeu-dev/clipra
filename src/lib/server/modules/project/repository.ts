// src/lib/server/repositories/project.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IProjectRepository } from './interfaces/IProjectRepository';

export class ProjectRepository
	extends BaseRepository<typeof table.projects, table.Project, table.NewProject>
	implements IProjectRepository
{
	constructor() {
		super(table.projects);
	}

	async getPaginatedProjects(
		page: number,
		limit: number,
		search?: string,
		userId?: string,
		isAdmin: boolean = false,
		clientId?: string,
		companyId?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<{ data: any[]; total: number }> {
		const { db } = await import('$lib/server/database');
		const { like, or, and, inArray, count, eq } = await import('drizzle-orm');
		const offset = (page - 1) * limit;

		let whereCondition = undefined;
		const searchCondition = search
			? or(
					like(table.projects.name, `%${search}%`),
					like(table.projects.description, `%${search}%`)
				)
			: undefined;

		const clientCondition = clientId ? eq(table.projects.clientId, clientId) : undefined;

		// Company Context Logic
		let companyCondition = undefined;
		if (companyId) {
			// Find clients belonging to this company
			const companyClients = await db
				.select({ id: table.clients.id })
				.from(table.clients)
				.where(eq(table.clients.companyId, companyId));

			const clientIds = companyClients.map((c) => c.id);

			// If company has no clients, it can have no projects
			if (clientIds.length === 0) {
				return { data: [], total: 0 };
			}

			companyCondition = inArray(table.projects.clientId, clientIds);
		}

		// Role Based Access Control Query
		if (!isAdmin && userId) {
			// Find Project IDs assigned to user
			const assignedProjects = await db
				.select({ projectId: table.projectUsers.projectId })
				.from(table.projectUsers)
				.where(eq(table.projectUsers.userId, userId));

			const projectIds = assignedProjects.map((p) => p.projectId);

			if (projectIds.length === 0) {
				return { data: [], total: 0 };
			}

			// Combine all conditions
			const conditions = [
				searchCondition,
				inArray(table.projects.id, projectIds),
				clientCondition,
				companyCondition
			].filter(Boolean); // Filter out undefined

			whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
		} else {
			// Admin/Manager: Combine search and client conditions
			const conditions = [searchCondition, clientCondition, companyCondition].filter(Boolean);

			whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
		}

		// Main Query - fetch projects only
		const projectsData = await db.query.projects.findMany({
			limit,
			offset,
			where: whereCondition,
			orderBy: (projects, { desc }) => [desc(projects.createdAt)]
		});

		// Fetch related data separately
		const resultProjectIds = projectsData.map((p) => p.id);

		let clientsData: table.Client[] = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let projectUsersData: any[] = [];
		let usersData: table.User[] = [];
		let rolesData: table.Role[] = [];
		let profilesData: table.UserProfiles[] = [];

		if (resultProjectIds.length > 0) {
			// Fetch clients
			const clientIds = [...new Set(projectsData.map((p) => p.clientId))];
			if (clientIds.length > 0) {
				clientsData = await db
					.select()
					.from(table.clients)
					.where(inArray(table.clients.id, clientIds));
			}

			// Fetch projectUsers
			projectUsersData = await db
				.select()
				.from(table.projectUsers)
				.where(inArray(table.projectUsers.projectId, resultProjectIds));

			// Fetch users for those projectUsers
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const userIds = [...new Set(projectUsersData.map((pu: any) => pu.userId))];
			if (userIds.length > 0) {
				usersData = await db.select().from(table.users).where(inArray(table.users.id, userIds));

				// Fetch roles
				const roleIds = [...new Set(usersData.map((u) => u.roleId).filter(Boolean))];
				if (roleIds.length > 0) {
					rolesData = await db.select().from(table.roles).where(inArray(table.roles.id, roleIds));
				}

				// Fetch profiles
				profilesData = await db
					.select()
					.from(table.userProfiles)
					.where(inArray(table.userProfiles.userId, userIds));
			}
		}

		// Manual merge
		const data = projectsData.map((project) => ({
			...project,
			client: clientsData.find((c) => c.id === project.clientId) || null,
			projectUsers: projectUsersData
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.filter((pu: any) => pu.projectId === project.id)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((pu: any) => {
					const user = usersData.find((u) => u.id === pu.userId);
					return {
						...pu,
						user: user
							? {
									...user,
									role: rolesData.find((r) => r.id === user.roleId) || null,
									profile: profilesData.find((p) => p.userId === user.id) || null
								}
							: null
					};
				})
		}));

		// Count Query
		const [totalResult] = await db
			.select({ count: count() })
			.from(table.projects)
			.where(whereCondition);

		return {
			data,
			total: totalResult.count
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getProjectByIdWithDetails(id: string): Promise<any> {
		const { db } = await import('$lib/server/database');
		const { eq, inArray } = await import('drizzle-orm');

		// 1. Fetch Project
		const project = await db.query.projects.findFirst({
			where: eq(table.projects.id, id)
		});

		if (!project) return null;

		// 2. Fetch Client
		const client = project.clientId
			? await db.query.clients.findFirst({
					where: eq(table.clients.id, project.clientId)
				})
			: null;

		// 3. Fetch Project Users
		const projectUsers = await db.query.projectUsers.findMany({
			where: eq(table.projectUsers.projectId, id)
		});

		// 4. Fetch Users for Project Users
		const userIds = [...new Set(projectUsers.map((pu) => pu.userId))];
		let users: table.User[] = [];
		let roles: table.Role[] = [];
		let profiles: table.UserProfiles[] = [];

		if (userIds.length > 0) {
			// Fetch users
			users = await db.select().from(table.users).where(inArray(table.users.id, userIds));

			// Fetch roles
			const roleIds = [...new Set(users.map((u) => u.roleId).filter(Boolean))];
			if (roleIds.length > 0) {
				roles = await db.select().from(table.roles).where(inArray(table.roles.id, roleIds));
			}

			// Fetch profiles
			profiles = await db
				.select()
				.from(table.userProfiles)
				.where(inArray(table.userProfiles.userId, userIds));
		}

		// 5. Fetch Tasks
		const tasksRaw = await db.query.tasks.findMany({
			where: eq(table.tasks.projectId, id)
		});

		const taskIds = [...new Set(tasksRaw.map((t) => t.id))];
		let allSubtasks: typeof tasksRaw = [];
		if (taskIds.length > 0) {
			allSubtasks = await db.query.tasks.findMany({
				where: inArray(table.tasks.parentId, taskIds)
			});
		}

		const tasks = tasksRaw.map((t) => ({
			...t,
			subtasks: allSubtasks.filter((st) => st.parentId === t.id)
		}));

		// 6. Fetch Timesheets and related Employee Rates
		const timesheetsRaw = await db.query.timesheets.findMany({
			where: eq(table.timesheets.projectId, id)
		});

		const tsUserIds = [
			...new Set(timesheetsRaw.map((ts) => ts.userId).filter(Boolean))
		] as string[];
		let tsUsers: table.User[] = [];
		let tsEmployees: table.Employee[] = [];
		if (tsUserIds.length > 0) {
			tsUsers = await db.select().from(table.users).where(inArray(table.users.id, tsUserIds));
			tsEmployees = await db
				.select()
				.from(table.employees)
				.where(inArray(table.employees.userId, tsUserIds));
		}

		const timesheets = timesheetsRaw.map((ts) => {
			const user = tsUsers.find((u) => u.id === ts.userId);
			return {
				...ts,
				user: user
					? {
							...user,
							employees: tsEmployees.filter((e) => e.userId === user.id)
						}
					: null
			};
		});

		// Calculate Actual Cost and Hours
		let totalActualHours = 0;
		let totalActualCost = 0;

		timesheets.forEach((ts) => {
			const hours = parseFloat(ts.hours as string) || 0;
			totalActualHours += hours;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const employee = (ts.user as any)?.employees?.[0];
			const rate = parseFloat(employee?.hourlyRate as string) || 0;
			totalActualCost += hours * rate;
		});

		// 6b. Fetch Procurement Data
		const purchaseRequisitionsRaw = await db.query.purchaseRequisitions.findMany({
			where: eq(table.purchaseRequisitions.projectId, id)
		});

		const prIds = purchaseRequisitionsRaw.map((pr) => pr.id);
		let prLines: table.PurchaseRequisitionLine[] = [];
		let prUsers: table.User[] = [];
		if (prIds.length > 0) {
			prLines = await db.query.purchaseRequisitionLines.findMany({
				where: inArray(table.purchaseRequisitionLines.requisitionId, prIds)
			});
			const prReqUserIds = [
				...new Set(purchaseRequisitionsRaw.map((pr) => pr.requestedById).filter(Boolean))
			] as string[];
			if (prReqUserIds.length > 0) {
				prUsers = await db.select().from(table.users).where(inArray(table.users.id, prReqUserIds));
			}
		}

		const purchaseRequisitions = purchaseRequisitionsRaw.map((pr) => ({
			...pr,
			requestedBy: pr.requestedById ? prUsers.find((u) => u.id === pr.requestedById) || null : null,
			lines: prLines.filter((l) => l.requisitionId === pr.id)
		}));

		const purchaseOrdersRaw = await db.query.purchaseOrders.findMany({
			where: eq(table.purchaseOrders.projectId, id)
		});

		const poIds = purchaseOrdersRaw.map((po) => po.id);
		let poLines: table.PurchaseOrderLine[] = [];
		let poSuppliers: table.Client[] = [];
		if (poIds.length > 0) {
			poLines = await db.query.purchaseOrderLines.findMany({
				where: inArray(table.purchaseOrderLines.orderId, poIds)
			});
			const poSupIds = [
				...new Set(purchaseOrdersRaw.map((po) => po.supplierId).filter(Boolean))
			] as string[];
			if (poSupIds.length > 0) {
				poSuppliers = await db
					.select()
					.from(table.clients)
					.where(inArray(table.clients.id, poSupIds));
			}
		}

		const purchaseOrders = purchaseOrdersRaw.map((po) => ({
			...po,
			supplier: po.supplierId ? poSuppliers.find((s) => s.id === po.supplierId) || null : null,
			lines: poLines.filter((l) => l.orderId === po.id)
		}));

		// Calculate Procurement Cost (from Purchase Orders that are not cancelled)
		let totalProcurementCost = 0;
		purchaseOrders.forEach((po) => {
			if (po.state !== 'cancelled') {
				totalProcurementCost += parseFloat(po.total as string) || 0;
			}
		});

		totalActualCost += totalProcurementCost;

		// 6c. Fetch Financial Data (Invoices)
		const projectInvoicesRaw = await db.query.invoices.findMany({
			where: eq(table.invoices.projectId, id)
		});

		const invIds = projectInvoicesRaw.map((inv) => inv.id);
		let invItems: table.InvoiceItem[] = [];
		if (invIds.length > 0) {
			invItems = await db.query.invoiceItems.findMany({
				where: inArray(table.invoiceItems.invoiceId, invIds)
			});
		}

		const projectInvoices = projectInvoicesRaw.map((inv) => ({
			...inv,
			items: invItems.filter((i) => i.invoiceId === inv.id)
		}));

		// Calculate Revenue (Total from non-cancelled invoices)
		let totalRevenue = 0;
		projectInvoices.forEach((inv) => {
			if (inv.status !== 'cancelled') {
				totalRevenue += parseFloat(inv.total as string) || 0;
			}
		});

		const totalProfit = totalRevenue - totalActualCost;

		// 7. Fetch Assignees for Tasks
		const assigneeIds = [...new Set(tasks.map((t) => t.assignedTo).filter(Boolean))] as string[];
		let assignees: table.User[] = [];
		let assigneeProfiles: table.UserProfiles[] = [];

		if (assigneeIds.length > 0) {
			assignees = await db.select().from(table.users).where(inArray(table.users.id, assigneeIds));
			assigneeProfiles = await db
				.select()
				.from(table.userProfiles)
				.where(inArray(table.userProfiles.userId, assigneeIds));
		}

		// 8. Aggregate Project Users with nested User -> Role, Profile
		const projectUsersWithDetails = projectUsers.map((pu) => {
			const user = users.find((u) => u.id === pu.userId);
			return {
				...pu,
				user: user
					? {
							...user,
							role: roles.find((r) => r.id === user.roleId) || null,
							userProfiles: profiles.find((p) => p.userId === user.id) || null // One-to-one
						}
					: null
			};
		});

		// Fix: userProfiles should be a single object likely if relation is one-to-one,
		// but original query `userProfiles: true` implies it might return list if defined as `many`,
		// or object if defined as `one`.
		// Looking at schema would help, but `findFirst` usually returns object for `one`.
		// Let's assume one-to-one based on `limit 1` in the error log subquery.
		// `projects_projectUsers_user_userProfiles`.`user_id` = ... limit 1
		// So `userProfiles` field in User should be an object (or array of 1).
		// Re-checking the error log: `select json_array(...) ... limit 1` suggests one-to-one or we just want the first.
		// However, in Drizzle `with: { userProfiles: true }` depends on relation definitions.
		// If I look at `repository.ts` imports, I can't see relation definitions.
		// But in the `getPaginatedProjects` manual merge, it used: `profile: profilesData.find(...) || null`.
		// The original query used `userProfiles: true`.
		// Let's attach as array if the original expected array, or object if object.
		// The error log showed `projects_projectUsers_user_userProfiles` which implies a relation name `userProfiles`.
		// If I look at `getPaginatedProjects` again:
		// `profile: profilesData.find((p) => p.userId === user.id) || null` (Singular `profile`).
		// But `getProjectByIdWithDetails` requested `userProfiles`.
		// This means the frontend likely expects `userProfiles`.
		// If it's a one-to-one, Drizzle usually names it `projects` (plural) unless aliased.
		// I'll filter.

		// 8. Aggregate Tasks with nested Assignee -> UserProfiles
		const tasksWithDetails = tasks.map((t) => {
			const assignee = assignees.find((u) => u.id === t.assignedTo);
			return {
				...t,
				assignee: assignee
					? {
							...assignee,
							userProfiles: assigneeProfiles.find((p) => p.userId === assignee.id) || null
						}
					: null
			};
		});

		return {
			...project,
			client,
			projectUsers: projectUsersWithDetails,
			tasks: tasksWithDetails,
			purchaseRequisitions,
			purchaseOrders,
			invoices: projectInvoices,
			stats: {
				totalActualHours,
				totalActualCost,
				totalProcurementCost,
				totalRevenue,
				totalProfit
			}
		};
	}

	async createWithMembers(data: table.NewProject, memberIds: string[]): Promise<table.Project> {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');

		return await db.transaction(async (tx) => {
			// 1. Create Project
			await tx.insert(table.projects).values(data);

			// 2. Assign Members
			if (memberIds.length > 0) {
				const memberData = memberIds.map((userId) => ({
					projectId: data.id,
					userId
				}));
				await tx.insert(table.projectUsers).values(memberData);
			}

			// Return the created project (dummy query to return type, or just cast data)
			const [createdProject] = await tx
				.select()
				.from(table.projects)
				.where(eq(table.projects.id, data.id));

			return createdProject;
		});
	}

	async updateWithMembers(
		id: string,
		data: Partial<table.Project>,
		memberIds: string[]
	): Promise<void> {
		const { db } = await import('$lib/server/database');
		const { eq } = await import('drizzle-orm');

		await db.transaction(async (tx) => {
			// 1. Update Project
			await tx.update(table.projects).set(data).where(eq(table.projects.id, id));

			// 2. Update Members (Delete All & Insert New)
			// a. Delete existing
			await tx.delete(table.projectUsers).where(eq(table.projectUsers.projectId, id));

			// b. Insert new
			if (memberIds.length > 0) {
				const memberData = memberIds.map((userId) => ({
					projectId: id,
					userId
				}));
				await tx.insert(table.projectUsers).values(memberData);
			}
		});
	}
}
