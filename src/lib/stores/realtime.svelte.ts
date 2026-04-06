import { browser } from '$app/environment';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export class RealtimeStore {
	status = $state<'connecting' | 'connected' | 'disconnected'>('disconnected');
	eventSource: EventSource | null = null;
	/* eslint-disable @typescript-eslint/no-explicit-any */
	listeners: SvelteMap<string, SvelteSet<(data: any) => void>> = new SvelteMap();

	connect() {
		if (!browser) return;
		if (this.eventSource?.readyState === 1) return;

		this.status = 'connecting';
		this.eventSource = new EventSource('/api/events');

		this.eventSource.onopen = () => {
			this.status = 'connected';
			console.log('SSE Connected');
		};

		this.eventSource.onerror = (err) => {
			console.error('SSE Error', err);
			this.status = 'disconnected';
			this.eventSource?.close();
			// Simple retry after 5s
			setTimeout(() => this.connect(), 5000);
		};

		// Listen for generic message (optional, commented out to avoid unused var)
		// this.eventSource.onmessage = (event) => {
		// 	// Handle default messages if any
		// };

		// Setup custom event listeners
		this.setupEventListeners();
	}

	private setupEventListeners() {
		if (!this.eventSource) return;

		// We can listen to specific event types here if we hardcode them,
		// or we can just rely on the fact that EventSource uses addEventListener
		// However, generic EventSource doesn't support wildcard listeners easily.
		// For a simple hub, we might send everything as 'message' or registering known types.

		// For dynamic usage, we can't easily iterate all events unless we proxy them.
		// Strategy: The endpoint sends named events. We need to know them in advance
		// OR we just assume 'notification', 'chat', etc.

		const knownEvents = ['notification', 'task_update', 'comment'];
		knownEvents.forEach((type) => {
			this.eventSource?.addEventListener(type, (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				this.emit(type, data);
			});
		});
	}

	on(event: string, callback: (data: any) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new SvelteSet());
		}
		this.listeners.get(event)?.add(callback);

		// Return unsubscribe function
		return () => {
			this.listeners.get(event)?.delete(callback);
		};
	}

	private emit(event: string, data: any) {
		if (this.listeners.has(event)) {
			this.listeners.get(event)?.forEach((cb) => cb(data));
		}
	}

	disconnect() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
			this.status = 'disconnected';
		}
	}
}

export const realtime = new RealtimeStore();
