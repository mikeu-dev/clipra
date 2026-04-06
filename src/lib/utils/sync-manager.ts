import { getSyncQueue, updateSyncAction, removeSyncAction } from './indexeddb';
import { offline } from '$lib/stores/offline.svelte';
import type { SyncAction } from './indexeddb';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

export class SyncManager {
	private isProcessing = false;

	async processQueue(): Promise<void> {
		if (this.isProcessing || !offline.isOnline) {
			return;
		}

		this.isProcessing = true;
		offline.setIsSyncing(true);

		try {
			const pendingActions = await getSyncQueue('pending');
			const failedActions = await getSyncQueue('failed');
			const actionsToProcess = [...pendingActions, ...failedActions];

			for (const action of actionsToProcess) {
				await this.processAction(action);
			}

			offline.setLastSyncTime(Date.now());
		} catch (error) {
			console.error('Error processing sync queue:', error);
		} finally {
			this.isProcessing = false;
			offline.setIsSyncing(false);
			await this.updateQueueCount();
		}
	}

	private async processAction(action: SyncAction): Promise<void> {
		try {
			// Update status to syncing
			await updateSyncAction(action.id, { status: 'syncing' });

			// Make API call based on action type
			const response = await this.executeAction(action);

			if (response.ok) {
				// Success - remove from queue
				await removeSyncAction(action.id);
			} else {
				// Failed - retry or mark as failed
				await this.handleFailure(action);
			}
		} catch (error) {
			console.error(`Error syncing action ${action.id}:`, error);
			await this.handleFailure(action);
		}
	}

	private async executeAction(action: SyncAction): Promise<Response> {
		const { entity, type, data } = action;
		const url = `/api/${entity}`;

		const options: RequestInit = {
			method: type === 'create' ? 'POST' : type === 'update' ? 'PUT' : 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		};

		if (type !== 'delete') {
			options.body = JSON.stringify(data);
		}

		return fetch(url, options);
	}

	private async handleFailure(action: SyncAction): Promise<void> {
		const newRetryCount = action.retryCount + 1;

		if (newRetryCount >= MAX_RETRIES) {
			// Max retries reached - mark as failed
			await updateSyncAction(action.id, {
				status: 'failed',
				retryCount: newRetryCount,
				error: 'Max retries reached'
			});
		} else {
			// Schedule retry
			await updateSyncAction(action.id, {
				status: 'pending',
				retryCount: newRetryCount
			});

			// Retry after delay
			const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
			setTimeout(() => {
				this.processQueue();
			}, delay);
		}
	}

	private async updateQueueCount(): Promise<void> {
		const pending = await getSyncQueue('pending');
		const failed = await getSyncQueue('failed');
		offline.setSyncQueueCount(pending.length + failed.length);
	}

	async retryFailed(): Promise<void> {
		const failedActions = await getSyncQueue('failed');

		for (const action of failedActions) {
			await updateSyncAction(action.id, {
				status: 'pending',
				retryCount: 0,
				error: undefined
			});
		}

		await this.processQueue();
	}
}

// Singleton instance
export const syncManager = new SyncManager();

// Auto-sync when coming online
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		setTimeout(() => {
			syncManager.processQueue();
		}, 1000);
	});
}
