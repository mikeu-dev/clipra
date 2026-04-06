/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncManager } from './sync-manager';
import * as indexeddb from './indexeddb';

// Mock dependensi
vi.mock('./indexeddb', () => ({
	getSyncQueue: vi.fn(),
	updateSyncAction: vi.fn(),
	removeSyncAction: vi.fn(),
	addToSyncQueue: vi.fn()
}));

vi.mock('$lib/stores/offline.svelte', () => ({
	offline: {
		isOnline: true,
		setIsSyncing: vi.fn(),
		setLastSyncTime: vi.fn(),
		setSyncQueueCount: vi.fn()
	}
}));

global.fetch = vi.fn() as unknown as typeof fetch;

describe('SyncManager', () => {
	let syncManager: SyncManager;

	beforeEach(() => {
		syncManager = new SyncManager();
		vi.clearAllMocks();
	});

	it('should process pending actions when online', async () => {
		const mockAction = {
			id: '123',
			type: 'create',
			entity: 'tasks',
			data: { title: 'Test Task' },
			timestamp: Date.now(),
			retryCount: 0,
			status: 'pending'
		};

		// Calls in processQueue
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([mockAction] as any);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);

		// Calls in updateQueueCount
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);

		vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);

		await syncManager.processQueue();

		expect(indexeddb.updateSyncAction).toHaveBeenCalledWith('123', { status: 'syncing' });
		expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.any(Object));
		expect(indexeddb.removeSyncAction).toHaveBeenCalledWith('123');
	});

	it('should handle failed sync and schedule retry', async () => {
		const mockAction = {
			id: '124',
			type: 'update',
			entity: 'projects',
			data: { name: 'Updated Project' },
			timestamp: Date.now(),
			retryCount: 0,
			status: 'pending'
		};

		// Calls in processQueue
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([mockAction] as any);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);

		// Calls in updateQueueCount (action is still pending/retrying)
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([mockAction] as any);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);

		vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);

		// Mock setTimeout to execute immediately
		vi.useFakeTimers();

		await syncManager.processQueue();

		expect(indexeddb.updateSyncAction).toHaveBeenCalledWith('124', {
			status: 'pending',
			retryCount: 1
		});

		vi.useRealTimers();
	});

	it('should mark as failed after max retries', async () => {
		const mockAction = {
			id: '125',
			type: 'delete',
			entity: 'clients',
			data: {},
			timestamp: Date.now(),
			retryCount: 2, // Assuming MAX_RETRIES is 3
			status: 'pending'
		};

		// Calls in processQueue
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([mockAction] as any);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);

		// Calls in updateQueueCount (action moved to failed)
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([]);
		vi.mocked(indexeddb.getSyncQueue).mockResolvedValueOnce([mockAction] as any);

		vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);

		await syncManager.processQueue();

		expect(indexeddb.updateSyncAction).toHaveBeenCalledWith('125', {
			status: 'failed',
			retryCount: 3,
			error: 'Max retries reached'
		});
	});
});
