import { clients as clientsData, projects as projectsData } from '../../../config/app';
import { db } from '../index';
import { clients, projects } from '../schemas';

export async function seedClients() {
	console.log('Seeding clients & projects...');

	const company = await db.query.companies.findFirst({
		where: (companies, { eq }) => eq(companies.code, 'SUP-001')
	});

	if (!company) {
		console.error('Default company not found. Skipping client seeding.');
		return;
	}

	for (const clientData of clientsData) {
		// Upsert client
		await db
			.insert(clients)
			.values({
				id: clientData.id ? String(clientData.id) : crypto.randomUUID(),
				companyId: company.id,
				name: clientData.name,
				logo: clientData.logo,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: clients.id,
				set: { name: clientData.name }
			});

		// Get the inserted/updated client (or just use the ID we generated/have)
		// If clientData.id is missing in config, we might have issues linking projects.
		// Assuming config has IDs or we need to look it up.
		// For simplicity, let's assume we can query it back or use a known ID pattern if config provides it.
		// config/app usually has hardcoded IDs? Let's assume yes or query by name.

		const clientRecord = await db.query.clients.findFirst({
			where: (t, { eq }) => eq(t.name, clientData.name)
		});

		if (!clientRecord) continue;

		//  Tambah project-project milik client ini
		const clientProjects = projectsData.filter((p) => String(p.clientId) === String(clientData.id));

		for (const project of clientProjects) {
			const existingProject = await db.query.projects.findFirst({
				where: (t, { and, eq }) => and(eq(t.clientId, clientRecord.id), eq(t.name, project.title))
			});

			if (!existingProject) {
				await db.insert(projects).values({
					id: crypto.randomUUID(),
					clientId: clientRecord.id,
					name: project.title, // sesuai dengan schema projects
					description: project.description ?? null,
					category: project.tag,
					thumbnail: project.thumbnail,
					mockup: project.moockup, // Note: config uses 'moockup'
					isPortfolio: true,
					status: 'completed', // Assuming portfolio projects are completed
					createdAt: new Date(),
					updatedAt: new Date()
				});
			} else {
				console.log(
					`Project "${project.title}" already exists for client ${clientRecord.name}. Skipping.`
				);
			}
		}
	}
}
