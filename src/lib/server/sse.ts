export const clients = new Set<ReadableStreamDefaultController>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcastEvent(type: string, data: any) {
	const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
	clients.forEach((controller) => {
		try {
			controller.enqueue(new TextEncoder().encode(payload));
		} catch (err) {
			console.error('Error sending to client', err);
			clients.delete(controller);
		}
	});
}
