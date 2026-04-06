import { ProjectModule } from '$lib/server/modules/project/module';
import { ClientModule } from '$lib/server/modules/client/module';
import { UserModule } from '$lib/server/modules/user/module';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { redirect, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { projectSchema } from '$lib/schemas/project';
import { generateId } from '$lib/utils/useUserId';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 9; // Grid of 9
	const search = url.searchParams.get('search') || undefined;
	const clientId = url.searchParams.get('client') || undefined;
	const companyId = locals.activeCompany?.id;

	const projectService = ProjectModule.getService();
	const clientService = ClientModule.getService(companyId);
	const userService = UserModule.getService();

	const service = projectService; // Removed 'as any'

	const roleName = locals.user.role?.name || '';
	const userId = locals.user.id;

	const { data: projects, total } = await service.getPaginatedProjects(
		page,
		limit,
		search,
		userId,
		roleName,
		clientId,
		companyId
	);

	// Fetch Options for Create Form
	// Only Admin/Manager can create, but we fetch anyway or optimize later
	const clients = await clientService.getSelectOptions(); // Assuming getAll exists or similar
	const users = await userService.getSelectOptions();

	// If filtered by client, find client name for UI
	let filteredClientName = '';
	if (clientId) {
		const client = clients.find((c) => c.id === clientId);
		filteredClientName = client ? client.name : '';
	}

	return {
		projects,
		total,
		page,
		limit,
		userRole: roleName,
		form: await superValidate(zod(projectSchema)),
		options: {
			clients,
			users: users.map((u) => ({ id: u.id, name: u.name, role: u.roleName }))
		},
		filteredClient: clientId ? { id: clientId, name: filteredClientName } : null
	};
};

export const actions: Actions = {
	create: async (event) => {
		if (!event.locals.permissions?.includes('projects.create')) {
			return fail(403, {
				message: m.error_access_denied_create_project()
			});
		}

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(projectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const projectService = ProjectModule.getService();
		let thumbnailPath = null;

		const thumbnailFile = formData.get('thumbnailFile') as File;
		if (thumbnailFile && thumbnailFile.size > 0 && thumbnailFile.name !== 'undefined') {
			const uploadDir = 'static/uploads/projects';
			await mkdir(uploadDir, { recursive: true });
			const fileName = `${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
			await writeFile(join(uploadDir, fileName), Buffer.from(await thumbnailFile.arrayBuffer()));
			thumbnailPath = `/uploads/projects/${fileName}`;
		}

		try {
			await projectService.createProject(
				{
					...form.data,
					id: generateId(),
					memberIds: undefined,
					thumbnail: thumbnailPath || undefined,
					isPortfolio: form.data.isPortfolio || false
				},
				form.data.memberIds
			);

			return { form };
		} catch (e) {
			return fail(500, { form, error: (e as Error).message });
		}
	},

	update: async (event) => {
		if (!event.locals.permissions?.includes('projects.update')) {
			return fail(403, {
				message: m.error_access_denied_update_project()
			});
		}

		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(projectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!form.data.id) {
			return fail(400, { form, error: 'Project ID is required' });
		}

		const projectService = ProjectModule.getService();
		let thumbnailPath = null;

		const thumbnailFile = formData.get('thumbnailFile') as File;
		if (thumbnailFile && thumbnailFile.size > 0 && thumbnailFile.name !== 'undefined') {
			const uploadDir = 'static/uploads/projects';
			await mkdir(uploadDir, { recursive: true });
			const fileName = `${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
			await writeFile(join(uploadDir, fileName), Buffer.from(await thumbnailFile.arrayBuffer()));
			thumbnailPath = `/uploads/projects/${fileName}`;
		}

		try {
			const updateData: Record<string, unknown> = {
				...form.data,
				id: undefined, // Don't update ID
				memberIds: undefined,
				isPortfolio: form.data.isPortfolio || false
			};

			if (thumbnailPath) {
				updateData.thumbnail = thumbnailPath;
			}

			await projectService.updateProject(form.data.id, updateData, form.data.memberIds);

			return { form };
		} catch (e) {
			return fail(500, { form, error: (e as Error).message });
		}
	},

	delete: async (event) => {
		if (!event.locals.permissions?.includes('projects.delete')) {
			return fail(403, {
				message: m.error_access_denied_delete_project()
			});
		}

		const data = await event.request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID is required' });

		const projectService = ProjectModule.getService();
		try {
			await projectService.delete(id);
			return { success: true };
		} catch (e) {
			return fail(500, { message: (e as Error).message });
		}
	}
};
