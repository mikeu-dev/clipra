import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/database';
import {
	companies,
	services,
	clients,
	projects,
	users,
	userProfiles,
	positions
} from '$lib/server/database/schemas';
import { eq, and, desc, asc } from 'drizzle-orm';
import { APP_CONFIG } from '$lib/config/app';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const { slug } = params;

	// 1. Validate Company (Locals matches what we found in hooks)
	// We can rely on locals.company if hook ran, BUT hooks run for all requests.
	// If hook failed or didn't find it, locals.company might be null.
	// Also, hooks might have set it based on URL, but let's be safe and verify slug match.

	// Actually, hooks handles the lookup. If locals.company is set and matches slug, use it.
	// Otherwise re-query or 404.

	let company = locals.company;

	if (!company || company.slug !== slug) {
		// Fallback if hook didn't catch it for some reason (though it should have)
		// or if we want to be explicit here.
		const companyRecord = await db.query.companies.findFirst({
			where: and(eq(companies.slug, slug), eq(companies.isPublic, true)),
			columns: {
				id: true,
				name: true,
				slug: true,
				themeConfig: true,
				isPublic: true
			}
		});

		if (!companyRecord) {
			throw error(404, 'Company not found');
		}
		company = companyRecord;
	}

	if (!company) {
		throw error(404, 'Company not found');
	}

	// 2. Fetch Company Data (Services, Team, Clients, Projects)
	// We need to implement filtering by companyId on these tables

	// Services
	const servicesData = await db.select().from(services).where(eq(services.companyId, company.id));

	// Team (Users linked to Company via Employee)
	const { employees } = await import('$lib/server/database/schemas');

	// Join users -> employees -> companies
	// We already have employees schema imported? No, added it above dynamically or need import
	// Let's assume standard join structure.

	const teamData = await db
		.select({
			name: users.name,
			position: positions.name,
			image: userProfiles.avatar
		})
		.from(users)
		.innerJoin(employees, eq(users.id, employees.userId))
		.innerJoin(userProfiles, eq(users.id, userProfiles.userId))
		.innerJoin(positions, eq(employees.positionId, positions.id))
		.where(eq(employees.companyId, company.id))
		.orderBy(asc(positions.name));

	// Clients
	const clientsData = await db.select().from(clients).where(eq(clients.companyId, company.id));

	// Projects
	// Projects link to clients. So we need to filter projects where client.companyId = company.id
	const projectsData = await db
		.select({
			id: projects.id,
			name: projects.name,
			description: projects.description,
			thumbnail: projects.thumbnail,
			isPortfolio: projects.isPortfolio,
			createdAt: projects.createdAt,
			clientId: projects.clientId
		})
		.from(projects)
		.innerJoin(clients, eq(projects.clientId, clients.id))
		.where(and(eq(clients.companyId, company.id), eq(projects.isPortfolio, true)))
		.orderBy(desc(projects.createdAt));

	// 3. Construct General Settings & Menu
	const themeConfig = (company.themeConfig as Record<string, unknown>) || {};

	// Merge defaults with company theme
	const generalSettings = {
		...APP_CONFIG,
		app_name: company.name,
		// If themeConfig has specific fields, override here
		// e.g. logo, email, phone if we add them to company table or settings
		...themeConfig // Assuming flat structure for now or mapped
	};

	// Construct Menu
	const navbarMenu = [
		{ label: 'Home', href: `/p/${slug}`, target: null },
		{ label: 'About', href: `/p/${slug}#about`, target: null },
		{ label: 'Services', href: `/p/${slug}#services`, target: null },
		{ label: 'Portfolio', href: `/p/${slug}#portfolio`, target: null },
		{ label: 'Contact', href: `/p/${slug}#contact`, target: null }
	];

	return {
		generalSettings,
		services: servicesData,
		team: teamData,
		clients: clientsData,
		projects: projectsData,
		company,
		navbarMenu // Pass explicit menu
	};
};
