import type { RequestEvent } from '@sveltejs/kit';
import { ServiceService } from './service';
import { fail } from '@sveltejs/kit';

export class ServiceController {
	constructor(private service: ServiceService) {}

	async handleCreate(event: RequestEvent) {
		const formData = await event.request.formData();
		const titleId = formData.get('titleId') as string;
		const descriptionId = formData.get('descriptionId') as string;
		const companyId = event.locals.activeCompany?.id;

		if (!companyId) return fail(400, { error: 'Company not found' });
		if (!titleId) return fail(400, { error: 'Title is required' });

		try {
			await this.service.createService({
				companyId,
				titleId,
				titleEn: (formData.get('titleEn') as string) || undefined,
				descriptionId,
				descriptionEn: (formData.get('descriptionEn') as string) || undefined,
				name: titleId // Using name as alias or internal name
			});
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Failed to create service' });
		}
	}

	async handleDelete(event: RequestEvent) {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { error: 'ID is required' });

		try {
			await this.service.delete(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete service' });
		}
	}
}
