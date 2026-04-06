import { json } from '@sveltejs/kit';
import { HikvisionListener } from '$lib/server/modules/hikvision/listener';

export const POST = async ({ request, getClientAddress }) => {
	try {
		// Mock IP for localhost testing if needed, but getClientAddress is standard
		const clientIp = getClientAddress();
		const listener = new HikvisionListener();

		const result = await listener.processEvent(request, clientIp);

		return json({ message: 'Event received', details: result });
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		if (errorMessage === 'UNAUTHORIZED_DEVICE') {
			return json({ error: 'Device Unauthorized' }, { status: 403 });
		}

		console.error('[Hikvision] API Error (Returning 200 to prevent retry loop):', error);
		// Important: Return 200 OK for any other error to prevent Hikvision retry storm.
		return json({ status: 'error_handled', message: errorMessage }, { status: 200 });
	}
};
