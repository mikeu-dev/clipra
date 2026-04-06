import { CategoryModule } from '$lib/server/modules/category/module';
import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import { idSchema } from '$lib/schemas/destroy';
import { categorySchema, type CategorySchema } from '$lib/schemas/category';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { logger } from '$lib/server/modules/core/logger';

const categoryService = CategoryModule.getService();

export const load: PageServerLoad = async (event) => {
	const activeCompanyId =
		event.locals.activeCompany?.id || (event.locals.session as { companyId?: string })?.companyId;

	if (!activeCompanyId) {
		console.error('LOAD: No active company ID found in locals', {
			hasSession: !!event.locals.session,
			hasActiveCompany: !!event.locals.activeCompany
		});
		return {
			categories: [],
			form: await superValidate(zod(categorySchema), { id: 'create-category-form' }),
			formDestroy: await superValidate(zod(idSchema), { id: 'delete-category-form' })
		};
	}

	const categories = await categoryService.getAll(activeCompanyId);

	return {
		categories,
		form: await superValidate(zod(categorySchema), { id: 'create-category-form' }),
		formDestroy: await superValidate(zod(idSchema), { id: 'delete-category-form' })
	};
};

export const actions = {
	create: async (event) => {
		const activeCompanyId =
			event.locals.activeCompany?.id || (event.locals.session as { companyId?: string })?.companyId;
		if (!activeCompanyId) return fail(401);

		const form: SuperValidated<Infer<CategorySchema>> = await superValidate(
			event,
			zod(categorySchema),
			{ id: 'create-category-form' }
		);

		logger.info('--- CATEGORY CREATE ATTEMPT ---', {
			valid: form.valid,
			data: form.data
		});

		if (!form.valid) {
			logger.warn('Validation errors during category creation', { errors: form.errors });
			return fail(400, { form });
		}

		try {
			await categoryService.create({
				id: form.data.id || '',
				name: form.data.name,
				type: form.data.type,
				companyId: activeCompanyId,
				parentId: form.data.parentId || null,
				description: form.data.description || null,
				color: form.data.color || null,
				icon: form.data.icon || null
			});
			logger.info('Category created successfully');
			return { form };
		} catch (error) {
			logger.error('Failed to create category', { error });
			return fail(500, {
				form,
				error: { message: 'Gagal membuat kategori nyaa~' }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema), { id: 'delete-category-form' });

		logger.info('--- CATEGORY DELETE ATTEMPT ---', { id: form.data.id });

		if (!form.valid) {
			logger.warn('Validation errors during category deletion', { errors: form.errors });
			return fail(400, { form });
		}

		try {
			await categoryService.delete(form.data.id);
			logger.info('Category deleted successfully');
			return { form };
		} catch (error) {
			logger.error('Failed to delete category', { error });
			return fail(500, {
				form,
				error: { message: 'Gagal menghapus kategori nyaa~' }
			});
		}
	},
	update: async (event) => {
		const form: SuperValidated<Infer<CategorySchema>> = await superValidate(
			event,
			zod(categorySchema),
			{ id: 'create-category-form' }
		);

		logger.info('--- CATEGORY UPDATE ATTEMPT ---', { data: form.data });

		if (!form.valid) {
			logger.warn('Validation errors during category update', { errors: form.errors });
			return fail(400, { form });
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await categoryService.update(id, {
				name: form.data.name,
				description: form.data.description || null,
				parentId: form.data.parentId || null,
				type: form.data.type,
				color: form.data.color || null,
				icon: form.data.icon || null
			});
			logger.info('Category updated successfully');
			return { form };
		} catch (error) {
			logger.error('Failed to update category', { error });
			return fail(500, {
				form,
				error: { message: 'Gagal memperbarui kategori nyaa~' }
			});
		}
	}
} satisfies Actions;
