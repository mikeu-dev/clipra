import { db } from '$lib/server/database';
import { warehouses } from '$lib/server/database/schemas/inventory/warehouses';
import { clients } from '$lib/server/database/schemas/clients';
import { projects } from '$lib/server/database/schemas/projects';
import { purchaseOrders } from '$lib/server/database/schemas/purchase/orders';
import { eq, and, isNotNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const companyId = locals.activeCompany?.id;
	if (!companyId) return { warehouses: [], vendors: [], projects: [], orders: [] };

	// Fetch data with coordinates
	const warehouseData = await db
		.select()
		.from(warehouses)
		.where(
			and(
				eq(warehouses.companyId, companyId),
				isNotNull(warehouses.latitude),
				isNotNull(warehouses.longitude)
			)
		);

	const vendorData = await db
		.select()
		.from(clients)
		.where(
			and(
				eq(clients.companyId, companyId),
				eq(clients.type, 'vendor'), // Only show vendors on procurement map
				isNotNull(clients.latitude),
				isNotNull(clients.longitude)
			)
		);

	const projectData = await db
		.select()
		.from(projects)
		.where(
			and(
				// Projects belong to clients, and clients belong to company.
				// A bit more complex to filter by companyId directly if projects table doesn't have it,
				// but wait, projects.ts has clientId but the load in project/+page.server.ts filters by companyId via client ids.
				isNotNull(projects.latitude),
				isNotNull(projects.longitude)
			)
		);

	// Filter projects by companyId (manual filter for now or join)
	// Actually our previous project load logic:
	// const companyClients = await db.select({ id: table.clients.id }).from(table.clients).where(eq(table.clients.companyId, companyId));

	const companyClients = await db
		.select({ id: clients.id })
		.from(clients)
		.where(eq(clients.companyId, companyId));
	const clientIds = companyClients.map((c) => c.id);

	const filteredProjects = projectData.filter((p) => clientIds.includes(p.clientId));

	// Fetch active POs to show routes with more details
	const activeOrders = await db
		.select({
			id: purchaseOrders.id,
			number: purchaseOrders.number,
			state: purchaseOrders.state,
			supplierId: purchaseOrders.supplierId,
			warehouseId: purchaseOrders.warehouseId,
			projectId: purchaseOrders.projectId,
			total: purchaseOrders.total,
			createdAt: purchaseOrders.createdAt
		})
		.from(purchaseOrders)
		.where(and(eq(purchaseOrders.companyId, companyId), isNotNull(purchaseOrders.supplierId)));

	return {
		warehouses: warehouseData,
		vendors: vendorData,
		projects: filteredProjects,
		orders: activeOrders
	};
};
