import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { ICareerRepository } from './interfaces/ICareerRepository';
import { count, eq, and, desc } from 'drizzle-orm';

export class CareerRepository
	extends BaseRepository<typeof table.jobs, table.Job, table.NewJob>
	implements ICareerRepository
{
	constructor() {
		super(table.jobs);
	}

	async getPaginated(
		page: number,
		limit: number,
		search?: string,
		status?: 'published' | 'draft' | 'closed'
	): Promise<{ data: (table.Job & { applicantCount: number })[]; total: number }> {
		const { db } = await import('$lib/server/database');
		const { like, or, getTableColumns } = await import('drizzle-orm');
		const offset = (page - 1) * limit;

		let whereCondition = undefined;
		const searchCondition = search
			? or(like(table.jobs.title, `%${search}%`), like(table.jobs.location, `%${search}%`))
			: undefined;

		if (status && search) {
			whereCondition = and(eq(table.jobs.status, status), searchCondition);
		} else if (status) {
			whereCondition = eq(table.jobs.status, status);
		} else if (search) {
			whereCondition = searchCondition;
		}

		// Fetch jobs with applicant count
		const data = await db
			.select({
				...getTableColumns(table.jobs),
				applicantCount: count(table.jobApplicants.id)
			})
			.from(table.jobs)
			.leftJoin(table.jobApplicants, eq(table.jobApplicants.jobId, table.jobs.id))
			.where(whereCondition)
			.groupBy(table.jobs.id)
			.orderBy(desc(table.jobs.createdAt))
			.limit(limit)
			.offset(offset);

		// Count total
		const [totalResult] = await db
			.select({ count: count() })
			.from(table.jobs)
			.where(whereCondition);

		return {
			data: data as (table.Job & { applicantCount: number })[],
			total: totalResult.count
		};
	}

	async getById(id: string): Promise<table.Job | undefined> {
		const { db } = await import('$lib/server/database');
		const result = await db.query.jobs.findFirst({
			where: eq(table.jobs.id, id)
		});
		return result;
	}

	async getBySlug(slug: string): Promise<table.Job | undefined> {
		const { db } = await import('$lib/server/database');
		const result = await db.query.jobs.findFirst({
			where: eq(table.jobs.slug, slug)
		});
		return result;
	}

	async getApplicants(jobId: string) {
		const { db } = await import('$lib/server/database');
		return await db.query.jobApplicants.findMany({
			where: eq(table.jobApplicants.jobId, jobId),
			orderBy: [desc(table.jobApplicants.createdAt)]
		});
	}

	async updateApplicantStatus(id: string, status: string) {
		const { db } = await import('$lib/server/database');
		await db
			.update(table.jobApplicants)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.set({ status: status as any, updatedAt: new Date() })
			.where(eq(table.jobApplicants.id, id));
	}

	async createApplicant(data: table.NewJobApplicant) {
		const { db } = await import('$lib/server/database');
		await db.insert(table.jobApplicants).values(data);
	}
}
