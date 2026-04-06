// Offline store using Svelte 5 runes
let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
let syncQueueCount = $state(0);
let isSyncing = $state(false);
let lastSyncTime = $state<number | null>(null);

// Network status
export const offline = {
	get isOnline() {
		return isOnline;
	},
	get isOffline() {
		return !isOnline;
	},
	get syncQueueCount() {
		return syncQueueCount;
	},
	get isSyncing() {
		return isSyncing;
	},
	get lastSyncTime() {
		return lastSyncTime;
	},
	setOnline(value: boolean) {
		isOnline = value;
	},
	setSyncQueueCount(count: number) {
		syncQueueCount = count;
	},
	setIsSyncing(value: boolean) {
		isSyncing = value;
	},
	setLastSyncTime(time: number) {
		lastSyncTime = time;
	}
};

// Initialize network listeners
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		offline.setOnline(true);
	});

	window.addEventListener('offline', () => {
		offline.setOnline(false);
	});
}
