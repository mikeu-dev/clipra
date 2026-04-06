<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import Bell from '@lucide/svelte/icons/bell';
	import { realtime } from '$lib/stores/realtime.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface NotificationItem {
		id: string;
		readAt: string | Date | null;
		title: string;
		message: string;
		actionUrl?: string;
		createdAt: string | Date;
	}
	let notifications = $state<NotificationItem[]>([]);
	let unreadCount = $derived(notifications.filter((n) => !n.readAt).length);

	onMount(() => {
		(async () => {
			try {
				const response = await fetch('/api/notifications');
				if (response.ok) {
					const result = await response.json();
					notifications = result.notifications || [];
				}
			} catch (err) {
				console.error(m.error_fetch_notifications(), err);
			}
		})();

		// Listen for new notifications
		const unsub = realtime.on('notification', (data) => {
			notifications = [data, ...notifications];
		});

		return unsub;
	});

	async function handleNotificationClick(id: string, url: string | null) {
		const index = notifications.findIndex((n) => n.id === id);

		// Lapor ke Server API jika notifikasi tersebut belum terbaca
		if (index !== -1 && !notifications[index].readAt) {
			notifications[index].readAt = new Date();
			try {
				await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
			} catch (err) {
				console.error(m.error_update_notification_status(), err);
			}
		}

		// Otomatis Redirect jika ada tautan pengumuman
		if (url) {
			goto(url);
		}
	}

	function getRelativeTime(dateString: string | Date | null) {
		if (!dateString) return '';
		const dateObj = new Date(dateString);
		if (isNaN(dateObj.getTime())) return '';

		const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto', style: 'short' });
		const diffMs = dateObj.getTime() - new Date().getTime();
		const diffSecs = Math.round(diffMs / 1000);
		const diffMins = Math.round(diffSecs / 60);
		const diffHours = Math.round(diffMins / 60);
		const diffDays = Math.round(diffHours / 24);

		if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
		if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
		if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
		return rtf.format(diffDays, 'day');
	}

	async function markAllAsRead() {
		if (unreadCount === 0) return;

		try {
			await fetch('/api/notifications/read-all', { method: 'POST' });
			notifications = notifications.map((n) => ({ ...n, readAt: n.readAt || new Date() }));
		} catch (err) {
			console.error(m.error_mark_all_notifications_read(), err);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" class="relative" {...props}>
				<Bell class="h-5 w-5" />
				{#if unreadCount > 0}
					<span
						class="absolute top-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-red-600"
					></span>
				{/if}
				<span class="sr-only">Notifications</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-80">
		<div class="flex items-center justify-between">
			<DropdownMenu.Label>Notifications</DropdownMenu.Label>
			{#if unreadCount > 0}
				<Button
					variant="ghost"
					size="sm"
					class="text-muted-foreground hover:text-foreground mr-2 h-auto px-2 py-1 text-xs"
					onclick={markAllAsRead}
				>
					{m.btn_mark_all_read()}
				</Button>
			{/if}
		</div>
		<DropdownMenu.Separator />
		{#if notifications.length === 0}
			<div class="text-muted-foreground p-4 text-center text-sm">{m.notifications_empty()}</div>
		{:else}
			<div class="max-h-[300px] overflow-y-auto">
				{#each notifications as notification (notification.id)}
					<DropdownMenu.Item
						class="flex cursor-pointer flex-col items-start gap-1 p-3 {notification.readAt
							? 'opacity-60'
							: ''}"
						onclick={() => handleNotificationClick(notification.id, notification.actionUrl || null)}
					>
						<div class="flex w-full items-start justify-between">
							<span class="text-sm font-medium">{notification.title}</span>
							{#if !notification.readAt}
								<span class="h-2 w-2 rounded-full bg-blue-600"></span>
							{/if}
						</div>
						<p class="text-muted-foreground line-clamp-2 text-xs">{notification.message}</p>
						<span class="text-muted-foreground text-[10px]"
							>{getRelativeTime(notification.createdAt)}</span
						>
					</DropdownMenu.Item>
				{/each}
			</div>
		{/if}
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			class="cursor-pointer justify-center text-center text-xs"
			onclick={() => goto('/panel/notifications')}
		>
			{m.btn_view_all_notifications()}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
