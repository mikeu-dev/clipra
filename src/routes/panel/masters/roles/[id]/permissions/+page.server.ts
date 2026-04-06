import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { RoleService } from '$lib/server/modules/role/service';
import { PermissionService } from '$lib/server/modules/permission/service';

const roleService = new RoleService();
const permissionService = new PermissionService();

export const load: PageServerLoad = async ({ params }) => {
	const roleId = params.id;
	const role = await roleService.getRoleById(roleId);
	if (!role) throw error(404, 'Role not found');

	const allPermissions = await permissionService.getAllPermissions();
	const rolePermissionNames = await permissionService.getPermissionNamesByRole(roleId);

	// Group permissions by resource
	const groupedPermissions: Record<string, typeof allPermissions> = {};
	for (const p of allPermissions) {
		if (!groupedPermissions[p.resource]) {
			groupedPermissions[p.resource] = [];
		}
		groupedPermissions[p.resource].push(p);
	}

	return {
		role,
		groupedPermissions,
		rolePermissions: rolePermissionNames
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const roleId = params.id;
		const formData = await request.formData();
		const permissionIds = formData.getAll('permissions') as string[];

		try {
			await permissionService.syncRolePermissions(roleId, permissionIds);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to update permissions' });
		}
	}
};
