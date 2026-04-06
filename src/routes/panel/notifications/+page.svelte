<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as m from '$lib/paraglide/messages.js';
	import Bell from '@lucide/svelte/icons/bell';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Check from '@lucide/svelte/icons/check';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CheckCheck from '@lucide/svelte/icons/check-check';
	import Info from '@lucide/svelte/icons/info';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import Settings from '@lucide/svelte/icons/settings';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { formatDistanceToNow } from 'date-fns';
	import { id as idLocale } from 'date-fns/locale';
	import { toast } from 'svelte-sonner';
	import { realtime } from '$lib/stores/realtime.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Separator } from '$lib/components/ui/separator';

	let { data } = $props();

	let notifications = $derived(data.notifications || []);
	let unreadCount = $derived(data.unreadCount || 0);
	let total = $derived(data.total || 0);
	let currentPage = $derived(data.currentPage || 1);
	let limit = $derived(data.limit || 20);
	let activeFilter = $derived(data.activeFilter || 'all');
	let totalPages = $derived(Math.ceil(total / limit));

	const filters = [
		{ id: 'all', label: 'Semua', icon: Bell },
		{ id: 'info', label: 'Info', icon: Info },
		{ id: 'warning', label: 'Peringatan', icon: AlertTriangle },
		{ id: 'success', label: 'Sukses', icon: CircleCheck },
		{ id: 'error', label: 'Error', icon: CircleX },
		{ id: 'task', label: 'Tugas', icon: ListTodo },
		{ id: 'system', label: 'Sistem', icon: Settings }
	];

	function getTypeConfig(type: string | null) {
		switch (type) {
			case 'warning':
				return {
					icon: AlertTriangle,
					color: 'text-amber-500',
					bg: 'bg-amber-50 dark:bg-amber-900/20',
					border: 'border-l-amber-500',
					badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
				};
			case 'success':
				return {
					icon: CircleCheck,
					color: 'text-emerald-500',
					bg: 'bg-emerald-50 dark:bg-emerald-900/20',
					border: 'border-l-emerald-500',
					badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
				};
			case 'error':
				return {
					icon: CircleX,
					color: 'text-red-500',
					bg: 'bg-red-50 dark:bg-red-900/20',
					border: 'border-l-red-500',
					badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
				};
			case 'task':
				return {
					icon: ListTodo,
					color: 'text-violet-500',
					bg: 'bg-violet-50 dark:bg-violet-900/20',
					border: 'border-l-violet-500',
					badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
				};
			case 'system':
				return {
					icon: Settings,
					color: 'text-slate-500',
					bg: 'bg-slate-50 dark:bg-slate-800/50',
					border: 'border-l-slate-500',
					badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
				};
			default:
				return {
					icon: Info,
					color: 'text-blue-500',
					bg: 'bg-blue-50 dark:bg-blue-900/20',
					border: 'border-l-blue-500',
					badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
				};
		}
	}

	function setFilter(filterId: string) {
		const url = new URL(page.url);
		if (filterId === 'all') {
			url.searchParams.delete('type');
		} else {
			url.searchParams.set('type', filterId);
		}
		url.searchParams.set('page', '1');
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function goToPage(p: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', p.toString());
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function handleNotificationClick(actionUrl: string | null) {
		if (actionUrl) {
			goto(actionUrl);
		}
	}

	// Real-time SSE listener
	onMount(() => {
		const unsub = realtime.on('notification_created', () => {
			toast.info(m.info_new_notification());
			invalidateAll();
		});

		return () => {
			unsub();
		};
	});
</script>

<svelte:head>
	<title>{m.menu_notification()}</title>
	<meta name="description" content="Pusat notifikasi dan pemberitahuan" />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
			>
				<BellRing class="h-5 w-5" />
			</div>
			<div>
				<h1
					class="flex items-center gap-2 text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100"
				>
					{m.menu_notification()}
					{#if unreadCount > 0}
						<Badge variant="destructive" class="animate-pulse">{unreadCount}</Badge>
					{/if}
				</h1>
				<p class="text-muted-foreground">
					{total} notifikasi total · {unreadCount} belum dibaca
				</p>
			</div>
		</div>

		{#if unreadCount > 0}
			<form
				action="?/markAllAsRead"
				method="POST"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') toast.success(m.success_all_notifications_read());
					};
				}}
			>
				<Button
					type="submit"
					variant="outline"
					size="sm"
					class="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
				>
					<CheckCheck class="h-4 w-4" />
					Tandai semua dibaca
				</Button>
			</form>
		{/if}
	</div>

	<!-- Filter Tabs -->
	<div class="mb-6 flex flex-wrap gap-2">
		{#each filters as filter (filter.id)}
			{@const isActive = activeFilter === filter.id}
			<Button
				variant={isActive ? 'default' : 'outline'}
				size="sm"
				class="flex items-center gap-1.5 transition-all {isActive
					? 'shadow-md'
					: 'hover:shadow-sm'}"
				onclick={() => setFilter(filter.id)}
			>
				<filter.icon class="h-3.5 w-3.5" />
				{filter.label}
			</Button>
		{/each}
	</div>

	<Separator class="mb-6" />

	<!-- Empty State -->
	{#if notifications.length === 0}
		<Card.Root class="flex flex-col items-center justify-center border-dashed py-16 text-center">
			<Card.Content>
				<div
					class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
				>
					<Bell class="h-10 w-10 text-slate-400" />
				</div>
				<h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
					Tidak ada notifikasi
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					{#if activeFilter !== 'all'}
						Tidak ada notifikasi dengan tipe "{filters.find((f) => f.id === activeFilter)?.label}".
					{:else}
						Anda belum memiliki notifikasi saat ini.
					{/if}
				</p>
				{#if activeFilter !== 'all'}
					<Button variant="outline" size="sm" class="mt-4" onclick={() => setFilter('all')}>
						Lihat semua notifikasi
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Notification List -->
	{:else}
		<div class="space-y-2">
			{#each notifications as notification (notification.id)}
				{@const typeConfig = getTypeConfig(notification.type)}
				{@const TypeIcon = typeConfig.icon}
				<Card.Root
					class="group relative overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md {typeConfig.border} {notification.readAt
						? 'bg-white dark:bg-slate-950'
						: typeConfig.bg} {notification.actionUrl ? 'cursor-pointer' : ''}"
				>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="p-4" onclick={() => handleNotificationClick(notification.actionUrl)}>
						<div class="flex items-start gap-3">
							<!-- Icon -->
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {typeConfig.badge}"
							>
								<TypeIcon class="h-4.5 w-4.5" />
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<h3
										class="truncate text-sm font-semibold {!notification.readAt
											? 'text-slate-900 dark:text-slate-100'
											: 'text-slate-600 dark:text-slate-400'}"
									>
										{notification.title}
									</h3>
									{#if !notification.readAt}
										<span class="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>
									{/if}
									{#if notification.actionUrl}
										<ExternalLink
											class="h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600"
										/>
									{/if}
								</div>
								{#if notification.message}
									<p
										class="mt-0.5 line-clamp-2 text-sm {!notification.readAt
											? 'text-slate-600 dark:text-slate-300'
											: 'text-slate-500 dark:text-slate-500'}"
									>
										{notification.message}
									</p>
								{/if}
								<div class="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
									<span
										>{notification.createdAt
											? formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
													locale: idLocale
												})
											: ''}</span
									>
									{#if notification.type}
										<Badge
											variant="outline"
											class="text-[10px] font-normal capitalize {typeConfig.badge}"
										>
											{notification.type}
										</Badge>
									{/if}
								</div>
							</div>

							<!-- Actions -->
							<div
								class="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
								onclick={(e) => e.stopPropagation()}
							>
								{#if !notification.readAt}
									<form
										action="?/markAsRead"
										method="POST"
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') toast.success(m.success_notification_read());
											};
										}}
									>
										<input type="hidden" name="id" value={notification.id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="h-7 w-7 text-slate-400 hover:text-emerald-500"
											title="Tandai telah dibaca"
										>
											<Check class="h-3.5 w-3.5" />
										</Button>
									</form>
								{/if}
								<form
									action="?/delete"
									method="POST"
									use:enhance={({ cancel }) => {
										if (!confirm(m.confirm_delete_notification())) {
											cancel();
										}
										return async ({ result }) => {
											if (result.type === 'success') {
												toast.success(m.success_notification_deleted());
											} else {
												toast.error(m.error_delete_notification());
											}
										};
									}}
								>
									<input type="hidden" name="id" value={notification.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-7 w-7 text-slate-400 hover:text-red-500"
										title={m.btn_delete()}
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</form>
							</div>
						</div>
					</div>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-6 flex items-center justify-between">
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Halaman {currentPage} dari {totalPages} · {total} notifikasi
				</p>
				<div class="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
						const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
						return start + i;
					}).filter((p) => p <= totalPages) as p (p)}
						<Button
							variant={p === currentPage ? 'default' : 'outline'}
							size="icon"
							class="h-8 w-8 text-xs"
							onclick={() => goToPage(p)}
						>
							{p}
						</Button>
					{/each}
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
