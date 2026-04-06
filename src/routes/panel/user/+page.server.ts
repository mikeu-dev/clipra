// src/routes/panel/user/+page.server.ts
import { superValidate } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { formSchema } from '$lib/server/modules/user/schemas/form';
import { zod } from 'sveltekit-superforms/adapters';
import { hash } from '@node-rs/argon2';
import { useInitials } from '$lib/utils/useInitials';
import type { Actions, PageServerLoad } from './$types';
import { fail, error } from '@sveltejs/kit';
import { destroySchema } from '$lib/schemas/user/destroy';
import { resetSchema } from '$lib/schemas/user/reset';
import 'dotenv/config';
import { UserModule } from '$lib/server/modules/user/module';
import { RoleModule } from '$lib/server/modules/role/module';
import { roleSchema } from '$lib/schemas/user/role';

const user = UserModule.getService();
const roleService = RoleModule.getService();

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.permissions?.includes('users.read')) {
		throw error(403, m.error_access_denied_view_users());
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 10;
	const search = url.searchParams.get('search') || undefined;
	const companyId = locals.activeCompany?.id;

	const { data: usersData, total } = await user.getPaginatedWithDetails(
		page,
		limit,
		search,
		companyId
	);

	const allUserWithData = usersData.map((u) => ({
		...u,
		initials: useInitials(u.name),
		// sessions, projects, tasks are now pre-populated by the repository
		sessions: u.sessions ?? [],
		projects: u.projects ?? [],
		tasks: u.tasks ?? []
	}));

	return {
		allUser: allUserWithData,
		countAllUser: total,
		currentPage: page,
		roles: await roleService.getAllRoles(companyId),
		formDestroy: await superValidate(zod(destroySchema)),
		form: await superValidate(zod(formSchema)),
		formReset: await superValidate(zod(resetSchema)),
		formRole: await superValidate(zod(roleSchema))
	};
};

export const actions = {
	create: async (event) => {
		if (!event.locals.permissions?.includes('users.create')) {
			return fail(403, { message: m.error_access_denied_create_user() });
		}

		const form = await superValidate(event, zod(formSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		const { name, email, password, roleId } = form.data;
		const companyId = event.locals.activeCompany?.id;

		// Hierarchy Check: Cannot create a user with a higher/equal role than self
		const executorLevel = event.locals.user?.role?.level || '99';
		const targetRole = await roleService.getRoleById(String(roleId));

		if (!user.canManage(executorLevel, targetRole.level || '50')) {
			return fail(403, {
				form,
				error: {
					message: m.error_access_denied_create_user_hierarchy()
				}
			});
		}

		try {
			const passwordHash = await hash(password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			const createdUser = await user.create({
				roleId: String(roleId), // This might set a global role, effectively same as company role if IDs match, or just a fallback
				name,
				email,
				username: email,
				passwordHash,
				emailVerified: true
			});

			if (companyId) {
				const { EmployeeService } = await import('$lib/server/modules/employee/service');
				const employeeService = new EmployeeService(companyId);
				const { generateId } = await import('$lib/utils/useUserId');
				await employeeService.create({
					id: generateId(),
					companyId,
					userId: createdUser.id,
					roleId: String(roleId),
					joinDate: new Date(),
					status: 'probation'
				});
			}

			return {
				form,
				success: true
			};
		} catch (e: unknown) {
			if (typeof e === 'object' && e !== null && 'code' in e) {
				const err = e as { code: string };
				if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
					return fail(400, {
						form,
						error: { message: 'Email already in use' }
					});
				}
				return fail(500, {
					form,
					error: { message: m.msg_error_an_error_occurred() }
				});
			}
			throw e;
		}
	},
	reset: async (event) => {
		if (!event.locals.permissions?.includes('users.update')) {
			return fail(403, {
				message: m.error_access_denied_reset_password()
			});
		}

		const form = await superValidate(event, zod(resetSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: 'ID tidak valid' }
			});
		}

		// Hierarchy Check
		const executorLevel = event.locals.user?.role?.level || '99';
		const targetUser = await user.getById(form.data.id);

		if (!user.canManage(executorLevel, targetUser.roleLevel || '50')) {
			return fail(403, {
				form,
				error: {
					message: m.error_access_denied_manage_user()
				}
			});
		}

		if (!process.env.PASSWORD_DEFAULT) {
			throw new Error('PASSWORD_DEFAULT environment variable is not set.');
		}

		try {
			const passwordHash = await hash(process.env.PASSWORD_DEFAULT, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			await user.updatePassword({
				id: form.data.id,
				passwordHash
			});

			return {
				form,
				success: true,
				message: 'Password berhasil direset'
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.msg_error_reset_password() }
			});
		}
	},
	destroy: async (event) => {
		if (!event.locals.permissions?.includes('users.delete')) {
			return fail(403, {
				message: m.error_access_denied_delete_user()
			});
		}

		const form = await superValidate(event, zod(destroySchema));

		if (!form.valid) {
			return fail(400, {
				form, // ubah dari formDestroy ke form
				error: { message: 'ID tidak valid' }
			});
		}

		// Hierarchy Check
		const executorLevel = event.locals.user?.role?.level || '99';
		const targetUser = await user.getById(form.data.id);

		if (!user.canManage(executorLevel, targetUser.roleLevel || '50')) {
			return fail(403, {
				form,
				error: {
					message: m.error_access_denied_delete_user_hierarchy()
				}
			});
		}

		try {
			await user.delete(form.data.id);
			return {
				form, // ubah dari formDestroy ke form
				success: true
			};
		} catch (e) {
			if (typeof e === 'object' && e !== null && 'code' in e) {
				const err = e as { code: string };
				if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
					return fail(400, {
						form, // ubah dari formDestroy ke form
						error: { message: m.msg_error_delete_user_constraint() }
					});
				}
				return fail(500, {
					form, // ubah dari formDestroy ke form
					error: { message: 'Terjadi kesalahan saat menghapus user.' }
				});
			}
			throw e;
		}
	},
	updateRole: async (event) => {
		if (!event.locals.permissions?.includes('users.update')) {
			return fail(403, {
				message: m.error_access_denied_update_role()
			});
		}

		const form = await superValidate(event, zod(roleSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: 'Input tidak valid' }
			});
		}

		// Hierarchy Check
		const executorLevel = event.locals.user?.role?.level || '99';
		const targetUser = await user.getById(form.data.id);
		const newRole = await roleService.getRoleById(form.data.roleId);

		// 1. Cannot manage target if level is higher/equal
		if (!user.canManage(executorLevel, targetUser.roleLevel || '50')) {
			return fail(403, {
				form,
				error: { message: m.error_access_denied_manage_user_general() }
			});
		}

		// 2. Cannot promote target to a level higher/equal than self
		if (!user.canManage(executorLevel, newRole.level || '50')) {
			return fail(403, {
				form,
				error: {
					message: m.error_access_denied_assign_role_hierarchy()
				}
			});
		}

		try {
			await user.updateRole({ id: form.data.id, roleId: form.data.roleId });
			return {
				form,
				success: true,
				message: 'Role berhasil diperbarui'
			};
		} catch (e) {
			console.error('Failed to update role:', e);
			return fail(500, {
				form,
				error: { message: m.msg_error_update_role() }
			});
		}
	}
} satisfies Actions;
