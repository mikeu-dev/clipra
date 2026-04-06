<script lang="ts">
	import {
		checkPushSupport,
		requestNotificationPermission,
		subscribeToPushNotifications,
		unsubscribeFromPushNotifications,
		type PushNotificationState
	} from '$lib/utils/push-notifications';
	import { onMount } from 'svelte';
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	let pushState: PushNotificationState = $state({
		isSupported: false,
		permission: 'default',
		subscription: null
	});

	let isLoading = $state(false);

	onMount(async () => {
		const isSupported = await checkPushSupport();
		let permission: NotificationPermission = 'default';
		let subscription: PushSubscription | null = null;

		if (isSupported) {
			permission = Notification.permission;
			if (permission === 'granted') {
				const registration = await navigator.serviceWorker.ready;
				subscription = await registration.pushManager.getSubscription();
			}
		}

		pushState = { isSupported, permission, subscription };
	});

	async function togglePush() {
		isLoading = true;
		try {
			if (pushState.subscription) {
				// Unsubscribe
				const success = await unsubscribeFromPushNotifications();
				if (success) {
					pushState.subscription = null;
					toast.success('Notifications disabled');
				}
			} else {
				// Subscribe
				if (pushState.permission === 'default') {
					const permission = await requestNotificationPermission();
					pushState.permission = permission;
					if (permission !== 'granted') {
						toast.error('Permission denied');
						return;
					}
				}

				if (pushState.permission === 'granted') {
					const sub = await subscribeToPushNotifications();
					if (sub) {
						pushState.subscription = sub;
						toast.success('Notifications enabled');
					} else {
						toast.error('Failed to subscribe');
					}
				}
			}
		} catch (error) {
			console.error('Toggle push error:', error);
			toast.error('An error occurred');
		} finally {
			isLoading = false;
		}
	}
</script>

{#if pushState.isSupported}
	<button
		onclick={togglePush}
		disabled={isLoading}
		class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
	>
		{#if isLoading}
			<LoaderCircle class="h-4 w-4 animate-spin" />
		{:else if pushState.subscription}
			<Bell class="h-4 w-4 text-blue-600" />
			<span>On</span>
		{:else}
			<BellOff class="h-4 w-4 text-slate-400" />
			<span>Off</span>
		{/if}
	</button>
{/if}
