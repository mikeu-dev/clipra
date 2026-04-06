import type { PageServerLoad, Actions } from './$types';
import { ServiceModule } from '$lib/server/modules/service/module';

const serviceController = ServiceModule.getController();
const serviceService = ServiceModule.getService();

export const load: PageServerLoad = async ({ locals }) => {
	const companyId = locals.activeCompany?.id;

	if (!companyId) {
		return { services: [] };
	}

	const services = await serviceService.getAllByCompany(companyId);

	return { services };
};

export const actions: Actions = {
	create: async (event) => {
		return await serviceController.handleCreate(event);
	},
	delete: async (event) => {
		return await serviceController.handleDelete(event);
	}
};
