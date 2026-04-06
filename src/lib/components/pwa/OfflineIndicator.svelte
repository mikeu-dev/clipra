<script lang="ts">
	import { offline } from '$lib/stores/offline.svelte';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import Wifi from '@lucide/svelte/icons/wifi';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { syncManager } from '$lib/utils/sync-manager';

	let { class: className = '' }: { class?: string } = $props();

	async function handleRetry() {
		await syncManager.processQueue();
	}
</script>

{#if offline.isOffline}
	<div class="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-96 {className}">
		<div
			class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-red-950"
		>
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					<WifiOff class="h-5 w-5 text-red-600 dark:text-red-400" />
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-semibold text-red-800 dark:text-red-200">You're Offline</h3>
					<p class="mt-1 text-sm text-red-700 dark:text-red-300">
						Some features may be limited. Changes will sync when you're back online.
					</p>
					{#if offline.syncQueueCount > 0}
						<p class="mt-2 text-xs text-red-600 dark:text-red-400">
							{offline.syncQueueCount} action{offline.syncQueueCount > 1 ? 's' : ''} pending sync
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else if offline.syncQueueCount > 0}
	<div class="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-96 {className}">
		<div
			class="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg dark:border-blue-800 dark:bg-blue-950"
		>
			<div class="flex items-start gap-3">
				<div class="flex-shrink-0">
					{#if offline.isSyncing}
						<RefreshCw class="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
					{:else}
						<Wifi class="h-5 w-5 text-blue-600 dark:text-blue-400" />
					{/if}
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-semibold text-blue-800 dark:text-blue-200">
						{offline.isSyncing ? 'Syncing...' : 'Ready to Sync'}
					</h3>
					<p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
						{offline.syncQueueCount} pending action{offline.syncQueueCount > 1 ? 's' : ''}
					</p>
				</div>
				{#if !offline.isSyncing}
					<button
						onclick={handleRetry}
						class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
					>
						Sync Now
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
