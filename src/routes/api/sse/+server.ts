import { notificationService } from '$lib/server/notifications';

export const GET = async ({ locals }: { locals: App.Locals }) => {
	// Verify user is authenticated
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const userId = locals.user.id;

	// Create SSE stream
	const stream = new ReadableStream({
		start(controller) {
			// Add client to notification service with userId
			notificationService.addClient(controller, userId);

			// Send initial connection message
			const connectMessage = `event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`;
			controller.enqueue(connectMessage);

			// Send heartbeat every 30 seconds to keep connection alive
			const heartbeatInterval = setInterval(() => {
				try {
					const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`;
					controller.enqueue(heartbeat);
				} catch (err) {
					console.error('Heartbeat failed:', err);
					clearInterval(heartbeatInterval);
					notificationService.removeClient(controller);
				}
			}, 30000);

			// Cleanup on connection close
			return () => {
				clearInterval(heartbeatInterval);
				notificationService.removeClient(controller);
			};
		},
		cancel() {
			// Client disconnected
			console.log('SSE connection closed for user:', userId);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no' // Disable nginx buffering
		}
	});
};
