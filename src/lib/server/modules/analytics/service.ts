import { db } from '$lib/server/database';
import { invoices, expenses } from '$lib/server/database/schemas';
import { sql, and, gte, lte, eq } from 'drizzle-orm';

export class AnalyticsService {
	static async getFinancialStats(startDate: Date, endDate: Date) {
		// Daily Revenue
		const revenue = await db
			.select({
				date: invoices.issueDate,
				amount: sql<number>`SUM(${invoices.total})`
			})
			.from(invoices)
			.where(
				and(
					gte(invoices.issueDate, startDate),
					lte(invoices.issueDate, endDate),
					sql`${invoices.status} != 'cancelled'`
				)
			)
			.groupBy(invoices.issueDate)
			.orderBy(invoices.issueDate);

		// Daily Expenses
		const exp = await db
			.select({
				date: expenses.date,
				amount: sql<number>`SUM(${expenses.amount})`
			})
			.from(expenses)
			.where(
				and(
					gte(expenses.date, startDate),
					lte(expenses.date, endDate),
					sql`${expenses.status} != 'rejected'`
				)
			)
			.groupBy(expenses.date)
			.orderBy(expenses.date);

		// Expenses by Category
		const expensesByCategory = await db
			.select({
				category: expenses.category,
				amount: sql<number>`SUM(${expenses.amount})`
			})
			.from(expenses)
			.where(
				and(
					gte(expenses.date, startDate),
					lte(expenses.date, endDate),
					sql`${expenses.status} != 'rejected'`
				)
			)
			.groupBy(expenses.category);

		// Calculate Totals
		const totalRevenue = revenue.reduce((acc, curr) => acc + Number(curr.amount), 0);
		const totalExpenses = exp.reduce((acc, curr) => acc + Number(curr.amount), 0);
		const netProfit = totalRevenue - totalExpenses;

		return {
			revenue,
			expenses: exp,
			expensesByCategory,
			kpi: {
				totalRevenue,
				totalExpenses,
				netProfit,
				margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
			}
		};
	}

	static async getProjectStats() {
		const { projects, tasks, projectColumns } = await import('$lib/server/database/schemas');

		// Projects by Status
		const projectStatus = await db
			.select({
				status: projects.status,
				count: sql<number>`COUNT(*)`
			})
			.from(projects)
			.groupBy(projects.status);

		// Task Completion Status
		const taskStatus = await db
			.select({
				status: projectColumns.name,
				count: sql<number>`COUNT(*)`
			})
			.from(tasks)
			.leftJoin(projectColumns, eq(tasks.columnId, projectColumns.id))
			.groupBy(projectColumns.name);

		const totalProjects = projectStatus.reduce((acc, curr) => acc + Number(curr.count), 0);
		const totalTasks = taskStatus.reduce((acc, curr) => acc + Number(curr.count), 0);

		// Calculate completion rate
		const completedTasks = taskStatus.find((t) => t.status === 'completed')?.count || 0;
		const completionRate = totalTasks > 0 ? (Number(completedTasks) / totalTasks) * 100 : 0;

		return {
			projectStatus,
			taskStatus,
			kpi: {
				totalProjects,
				totalTasks,
				completionRate
			}
		};
	}

	static async getTaskStats() {
		// ... would import tasks schema
		return {};
	}
}
