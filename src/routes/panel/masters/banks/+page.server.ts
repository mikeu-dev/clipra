import { superValidate } from 'sveltekit-superforms';
import * as m from '$lib/paraglide/messages.js';

import { bankSchema } from '$lib/schemas/bank';
import { idSchema } from '$lib/schemas/destroy';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { BankModule } from '$lib/server/modules/bank/module';

const bankService = BankModule.getService();

export const load: PageServerLoad = async () => {
	const banks = await bankService.getAll();

	return {
		banks,
		form: await superValidate(zod(bankSchema)),
		formDestroy: await superValidate(zod(idSchema))
	};
};

export const actions = {
	create: async (event) => {
		const form = await superValidate(event, zod(bankSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			await bankService.create({
				...form.data
				// Generate ID if not present (although usually controller/repo handles ID generation,
				// explicit ID generation ensures consistency if needed)
			});
			return {
				form,
				success: true
			};
		} catch (e) {
			const err = e as { code?: string };
			if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'ER_DUP_ENTRY') {
				return fail(400, {
					form,
					error: { message: m.msg_error_code_exists() }
				});
			}
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_create_bank() }
			});
		}
	},
	destroy: async (event) => {
		const form = await superValidate(event, zod(idSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_invalid_id() }
			});
		}

		try {
			await bankService.delete(form.data.id);
			return {
				form,
				success: true
			};
		} catch {
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_delete_bank() }
			});
		}
	},
	update: async (event) => {
		const form = await superValidate(event, zod(bankSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: { message: m.msg_error_check_input() }
			});
		}

		try {
			const id = form.data.id;
			if (!id) return fail(400, { form });

			await bankService.update(id, form.data);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, {
				form,
				error: { message: m.msg_error_failed_update_bank() }
			});
		}
	}
} satisfies Actions;
