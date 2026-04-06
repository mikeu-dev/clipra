import { json } from '@sveltejs/kit';
import { NewsletterModule } from '$lib/server/modules/newsletter/module';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const subscribeSchema = z.object({
	email: z.string().email()
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		const result = subscribeSchema.safeParse({ email });

		if (!result.success) {
			return json({ message: 'Invalid email address' }, { status: 400 });
		}

		const service = NewsletterModule.getService();
		await service.subscribe(result.data.email);

		return json({ message: 'Subscribed successfully' });
	} catch (error) {
		console.error('Subscription error:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
