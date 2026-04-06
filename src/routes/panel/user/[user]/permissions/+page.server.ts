import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserService } from '$lib/server/modules/user/service';
import { PermissionService } from '$lib/server/modules/permission/service';
import * as m from '$lib/paraglide/messages.js';

const userService = new UserService();
const permissionService = new PermissionService();

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = params.user;

	// Security Checks:
	// 1. Cannot edit own custom permissions
	if (locals.user?.id === userId) {
		throw error(403, 'Anda tidak dapat mengubah hak akses khusus untuk diri sendiri.');
	}

	const user = await userService.getById(userId);
	if (!user) throw error(404, 'User not found');

	// 2. Hierarchy Check
	const executorLevel = locals.user?.role?.level || '99';
	if (!userService.canManage(executorLevel, user.roleLevel || '50')) {
		throw error(403, m.error_access_denied_manage_user_hierarchy());
	}

	const allPermissions = await permissionService.getAllPermissions();
	const userPermissionNames = await permissionService.getPermissionNamesByUser(userId);

	// Group permissions by resource
	const groupedPermissions: Record<string, typeof allPermissions> = {};
	for (const p of allPermissions) {
		if (!groupedPermissions[p.resource]) {
			groupedPermissions[p.resource] = [];
		}
		groupedPermissions[p.resource].push(p);
	}

	return {
		user,
		groupedPermissions,
		userPermissions: userPermissionNames
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const userId = params.user;

		// Security Checks on action:
		if (locals.user?.id === userId) {
			return fail(403, { message: m.error_access_denied_modify_self() });
		}

		const targetUser = await userService.getById(userId);
		if (!targetUser) {
			return fail(404, { message: 'User not found' });
		}

		// Hierarchy Check
		const executorLevel = locals.user?.role?.level || '99';
		if (!userService.canManage(executorLevel, targetUser.roleLevel || '50')) {
			return fail(403, {
				message: m.error_access_denied_manage_user_hierarchy()
			});
		}

		const formData = await request.formData();
		const permissionIds = formData.getAll('permissions') as string[];

		try {
			await permissionService.syncUserPermissions(userId, permissionIds);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update user permissions' });
		}
	}
};
