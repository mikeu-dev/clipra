import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { zod } from 'sveltekit-superforms/adapters';
import { employeeFormSchema, type EmployeeFormSchema } from '$lib/schemas/employee/employee';
import { EmployeeModule } from '$lib/server/modules/employee/module';
import { UserModule } from '$lib/server/modules/user/module';
import { BankModule } from '$lib/server/modules/bank/module';
import { db } from '$lib/server/database';
import {
	companies,
	positions,
	shifts,
	employeeSalaries,
	salaryComponents,
	employeeSalaryComponents
} from '$lib/server/database/schemas';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { generateId } from '$lib/utils/useUserId';
import type { Actions, PageServerLoad } from './$types';

const employeeService = EmployeeModule.getService();
const userService = UserModule.getService();
const bankService = BankModule.getService();

export const load: PageServerLoad = async ({ params }) => {
	const employeeId = params.id;
	if (!employeeId) throw error(404, 'Employee ID required');

	let employee;
	try {
		employee = await employeeService.getById(employeeId);
	} catch {
		throw error(404, 'Employee not found');
	}

	// Populate form with existing data
	const form: SuperValidated<Infer<EmployeeFormSchema>> = await superValidate(
		zod(employeeFormSchema)
	);
	form.data = {
		id: employee.id,
		userId: employee.userId,
		companyId: employee.companyId,
		nik: employee.nik ?? '',
		idCard: employee.idCard ?? '',
		positionId: employee.positionId ?? undefined,
		shiftId: employee.shiftId ?? undefined,
		status:
			(employee.status as 'permanent' | 'contract' | 'probation' | 'internship') ?? 'permanent',
		joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
		taxNumber: employee.taxNumber ?? '',
		workPhone: employee.workPhone ?? '',
		workEmail: employee.workEmail ?? '',
		bankName: employee.bankName ?? '',
		bankAccountNumber: employee.bankAccountNumber ?? ''
	};

	// Options
	const usersData = await userService.getSelectOptions();
	const companiesData = await db.select({ id: companies.id, name: companies.name }).from(companies);
	const positionsData = await db
		.select({ id: positions.id, name: positions.name, companyId: positions.companyId })
		.from(positions);
	const shiftsData = await db
		.select({ id: shifts.id, name: shifts.name, companyId: shifts.companyId })
		.from(shifts);

	// Get current salary
	const salaryData = await db
		.select()
		.from(employeeSalaries)
		.where(and(eq(employeeSalaries.employeeId, employeeId), isNull(employeeSalaries.endDate)))
		.orderBy(desc(employeeSalaries.effectiveDate))
		.limit(1);
	const currentSalary = salaryData[0] || null;

	// Get available salary components for this company
	const availableComponents = await db
		.select()
		.from(salaryComponents)
		.where(
			and(eq(salaryComponents.companyId, employee.companyId), eq(salaryComponents.isActive, true))
		);

	// Get assigned components for this employee
	const assignedComponents = await db
		.select({
			assignment: employeeSalaryComponents,
			component: salaryComponents
		})
		.from(employeeSalaryComponents)
		.innerJoin(salaryComponents, eq(employeeSalaryComponents.componentId, salaryComponents.id))
		.where(eq(employeeSalaryComponents.employeeId, employeeId));

	return {
		form,
		options: {
			users: usersData,
			companies: companiesData,
			positions: positionsData,
			shifts: shiftsData,
			banks: await bankService.getAll()
		},
		employee, // Pass full object if needed for display
		currentSalary,
		availableComponents,
		assignedComponents
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(employeeFormSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const employeeId = event.params.id;
		if (!employeeId) return fail(400, { form, error: { message: 'Missing ID' } });

		try {
			await employeeService.update(employeeId, {
				...form.data,
				joinDate: form.data.joinDate ? new Date(form.data.joinDate) : undefined
			});
		} catch (e) {
			console.error(e);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_employee() }
			});
		}

		throw redirect(303, '/panel/hr/employee');
	},

	setSalary: async ({ request, params }) => {
		const formData = await request.formData();
		const amount = formData.get('amount') as string;
		const effectiveDate = formData.get('effectiveDate') as string;
		const employeeId = params.id;

		if (!amount || !effectiveDate || !employeeId) {
			return fail(400, { error: 'Amount and effective date are required' });
		}

		try {
			// End previous salary record
			const prevSalaries = await db
				.select()
				.from(employeeSalaries)
				.where(and(eq(employeeSalaries.employeeId, employeeId), isNull(employeeSalaries.endDate)));

			for (const prev of prevSalaries) {
				await db
					.update(employeeSalaries)
					.set({ endDate: new Date(effectiveDate) })
					.where(eq(employeeSalaries.id, prev.id));
			}

			// Insert new salary
			await db.insert(employeeSalaries).values({
				id: generateId(),
				employeeId,
				amount,
				type: 'monthly',
				effectiveDate: new Date(effectiveDate)
			});

			return { salarySuccess: true };
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Failed to set salary' });
		}
	},

	assignComponent: async ({ request, params }) => {
		const formData = await request.formData();
		const componentId = formData.get('componentId') as string;
		const amount = formData.get('amount') as string;
		const employeeId = params.id;

		if (!componentId || !employeeId) {
			return fail(400, { error: 'Component required' });
		}

		try {
			// Check if already assigned
			const existing = await db
				.select()
				.from(employeeSalaryComponents)
				.where(
					and(
						eq(employeeSalaryComponents.employeeId, employeeId),
						eq(employeeSalaryComponents.componentId, componentId)
					)
				);

			if (existing.length > 0) {
				// Update amount
				await db
					.update(employeeSalaryComponents)
					.set({ amount: amount || '0', isActive: true })
					.where(eq(employeeSalaryComponents.id, existing[0].id));
			} else {
				await db.insert(employeeSalaryComponents).values({
					id: generateId(),
					employeeId,
					componentId,
					amount: amount || '0',
					isActive: true
				});
			}

			return { componentSuccess: true };
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Failed to assign component' });
		}
	},

	removeComponent: async ({ request }) => {
		const formData = await request.formData();
		const assignmentId = formData.get('assignmentId') as string;

		if (!assignmentId) return fail(400, { error: 'Assignment ID required' });

		try {
			await db
				.delete(employeeSalaryComponents)
				.where(eq(employeeSalaryComponents.id, assignmentId));
			return { componentSuccess: true };
		} catch {
			return fail(500, { error: 'Failed to remove' });
		}
	}
};
