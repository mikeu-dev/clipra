import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { zod } from 'sveltekit-superforms/adapters';
import { employeeFormSchema, type EmployeeFormSchema } from '$lib/schemas/employee/employee';
import { EmployeeModule } from '$lib/server/modules/employee/module';
import { UserModule } from '$lib/server/modules/user/module';
import { BankModule } from '$lib/server/modules/bank/module';
import { db } from '$lib/server/database'; // Direct db access for simple option fetching or use modules if available
import { companies, positions, shifts } from '$lib/server/database/schemas';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const employeeService = EmployeeModule.getService();
const userService = UserModule.getService();
const bankService = BankModule.getService();

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(employeeFormSchema));

	// Fetch options
	// Ideally these should come from their own services, but for MVP direct DB or generic service is fine.
	// Fetch users who are NOT yet employees? Or just all users?
	// Let's fetch all users for now.
	const usersData = await userService.getSelectOptions(); // Returns {id, name, roleName}

	const companiesData = await db.select({ id: companies.id, name: companies.name }).from(companies);
	const positionsData = await db
		.select({ id: positions.id, name: positions.name, companyId: positions.companyId })
		.from(positions);
	const shiftsData = await db
		.select({ id: shifts.id, name: shifts.name, companyId: shifts.companyId })
		.from(shifts);

	const banksData = await bankService.getAll();

	return {
		form,
		options: {
			users: usersData,
			companies: companiesData,
			positions: positionsData,
			shifts: shiftsData,
			banks: banksData
		}
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form: SuperValidated<Infer<EmployeeFormSchema>> = await superValidate(
			event,
			zod(employeeFormSchema)
		);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await employeeService.create({
				id: crypto.randomUUID(),
				...form.data,
				joinDate: form.data.joinDate ? new Date(form.data.joinDate) : undefined
			});
		} catch (e) {
			console.error(e);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_employee() }
			});
		}

		throw redirect(303, '/panel/hr/employee');
	}
};
