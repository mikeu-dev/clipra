import type { RequestHandler } from './$types';

import { clients } from '$lib/server/sse';

export const GET: RequestHandler = async () => {
	const stream = new ReadableStream({
		start(controller) {
			clients.add(controller);
			// Send initial connection event
			const initPayload = `event: connected\ndata: "connected"\n\n`;
			controller.enqueue(new TextEncoder().encode(initPayload));
		},
		cancel(controller) {
			clients.delete(controller);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
