import { SessionController } from '$lib/server/modules/session/controller';
import { redirect, type RequestHandler } from '@sveltejs/kit';

const sessionController = new SessionController();

export const POST: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return new Response(null, { status: 401 });
	}

	await sessionController.destroy(event);

	throw redirect(302, '/');
};
