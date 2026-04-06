// src/routes/panel/contact/view/[id]/+page.server.ts
import { contactSchema } from '$lib/schemas/contact/contact';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { ContactService } from '$lib/server/modules/contact/service';

const contactService = new ContactService();

export const load: PageServerLoad = async ({ params }) => {
	const contact = await contactService.getById(params.id);
	console.log('[LOAD] Memuat contact dengan ID:', params.id);

	if (!contact) throw error(404, 'contact tidak ditemukan');

	if (contact.id && !contact.isRead) {
		await contactService.update(contact.id, { isRead: true });
	}

	return {
		contact,
		form: await superValidate(contact, zod(contactSchema))
	};
};
