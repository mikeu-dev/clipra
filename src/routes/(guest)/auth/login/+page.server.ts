import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { superValidate, message } from 'sveltekit-superforms';
import { formSchema } from '$lib/schemas/auth/login';
import { zod } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database';
import * as table from '$lib/server/database/schemas';
import type { Actions, PageServerLoad } from './$types';
import { SessionController } from '$lib/server/modules/session/controller';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		throw redirect(302, '/panel');
	}

	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password, rememberMe } = form.data;

		const [existingUser] = await db.select().from(table.users).where(eq(table.users.email, email));

		if (!existingUser) {
			return message(form, 'Email atau kata sandi salah.', { status: 400 });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return message(form, 'Email atau kata sandi salah.', { status: 400 });
		}

		const sessionController = new SessionController();
		await sessionController.create(event, existingUser.id, rememberMe ? 30 : 1);

		throw redirect(302, '/panel');
	}
};
