import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { UserModule } from '$lib/server/modules/user/module';

const userController = UserModule.create();

export const load: LayoutServerLoad = async ({ params }) => {
	console.log('params', params);

	const user = await userController.show(params.user);

	if (!user) throw error(404, 'User tidak ditemukan');

	return {
		user
	};
};
