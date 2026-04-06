import { CompanyController } from '$lib/server/modules/superadmin/company/controller';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const controller = new CompanyController();

export const load: PageServerLoad = async () => {
	const companies = await controller.index();
	return { companies };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const code = formData.get('code') as string;
		const email = formData.get('email') as string;

		if (!name || !slug || !code) {
			return fail(400, { missing: true });
		}

		const logoServerId = formData.get('logo') as string;
		let logoPath = null;

		if (logoServerId) {
			const tmpPath = path.join(process.cwd(), 'static/tmp', logoServerId);
			if (fs.existsSync(tmpPath)) {
				const uploadDir = 'static/uploads/logos';
				if (!fs.existsSync(uploadDir)) {
					fs.mkdirSync(uploadDir, { recursive: true });
				}

				const ext = path.extname(logoServerId);
				const filename = `${slug}-${Date.now()}${ext}`;
				const filePath = path.join(uploadDir, filename);

				fs.renameSync(tmpPath, filePath);
				logoPath = `/uploads/logos/${filename}`;
			}
		}

		try {
			await controller.create({
				name,
				slug,
				code,
				email,
				logo: logoPath,
				isPublic: true,
				themeConfig: {}
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: (error as Error).message });
		}
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { missing: true });

		try {
			await controller.destroy(id);
			return { success: true };
		} catch (error) {
			return fail(500, { error: (error as Error).message });
		}
	}
};
