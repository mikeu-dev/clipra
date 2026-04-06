import { APP_CONFIG } from '$lib/config/app';
import type { LayoutServerLoad } from './$types';
import { useAppConfig } from '$lib/utils/useAppConfig';
import { SettingController } from '$lib/server/modules/setting/controller';
import { db } from '$lib/server/database';
import {
	services,
	clients,
	users,
	userProfiles,
	positions,
	projects,
	employees
} from '$lib/server/database/schemas';
import { eq, desc, asc, and } from 'drizzle-orm';

const settingController = new SettingController();

export const load: LayoutServerLoad = async () => {
	const settingsRaw = await settingController.getMapByGroup('general');
	const settings = Object.fromEntries(
		Object.entries(settingsRaw).map(([key, value]) => [key, JSON.parse(value)])
	);
	// Merge DB settings into APP_CONFIG
	type AppConfigType = Record<string, { id: string; en: string }>;
	const mergedSettings = { ...APP_CONFIG } as AppConfigType;

	for (const [key, value] of Object.entries(settings)) {
		if (key in mergedSettings) {
			mergedSettings[key] = value as { id: string; en: string };
		}
	}

	const generalSettings = useAppConfig().toPerLocale(mergedSettings);

	// Fetch Initial Configuration from Supplyra Solutions
	const mainCompany = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'SUP-001')
	});

	if (!mainCompany) {
		// Fallback or handle error if needed, but for now we expect it to exist if seeded
		return {
			generalSettings: generalSettings ?? APP_CONFIG,
			services: [],
			team: [],
			clients: [],
			projects: []
		};
	}

	// Fetch Services
	const servicesData = await db
		.select()
		.from(services)
		.where(eq(services.companyId, mainCompany.id));

	// Fetch Team
	// Join: users -> employees -> positions (using employees.position_id)
	const teamData = await db
		.select({
			id: employees.id,
			name: users.name,
			position: positions.name,
			image: userProfiles.avatar,
			reportsTo: employees.reportsTo,
			division: employees.division
		})
		.from(users)
		.innerJoin(userProfiles, eq(users.id, userProfiles.userId))
		.innerJoin(employees, eq(users.id, employees.userId))
		.innerJoin(positions, eq(employees.positionId, positions.id))
		.where(and(eq(employees.companyId, mainCompany.id), eq(employees.isPublic, true)))
		.orderBy(asc(positions.name));

	// Fetch Clients
	const clientsData = await db.select().from(clients).where(eq(clients.companyId, mainCompany.id));

	// Fetch Projects (Portfolio)
	// Filter projects where the associated client belongs to the main company
	const projectsData = await db
		.select({
			id: projects.id,
			clientId: projects.clientId,
			name: projects.name,
			description: projects.description,
			startDate: projects.startDate,
			dueDate: projects.dueDate,
			status: projects.status,
			thumbnail: projects.thumbnail,
			mockup: projects.mockup,
			category: projects.category,
			techStack: projects.techStack,
			isPortfolio: projects.isPortfolio,
			deletedAt: projects.deletedAt,
			createdAt: projects.createdAt,
			updatedAt: projects.updatedAt
		})
		.from(projects)
		.innerJoin(clients, eq(projects.clientId, clients.id))
		.where(and(eq(projects.isPortfolio, true), eq(clients.companyId, mainCompany.id)))
		.orderBy(desc(projects.createdAt));

	return {
		generalSettings: generalSettings ?? APP_CONFIG,
		services: servicesData,
		team: teamData,
		clients: clientsData,
		projects: projectsData
	};
};
