<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import * as Select from '$lib/components/ui/select/index.js';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';

	let { user }: { user: { name: string; email: string; avatar: string; id: string } } = $props();
	const sidebar = useSidebar();
	let initialLocale = $state(getLocale());
	$effect(() => {
		if (initialLocale) {
			setLocale(initialLocale);
		}
	});

	import { sseStore } from '$lib/stores/sse-store';
	import { toast } from 'svelte-sonner';

	let isOpenLogout = $state(false);
	let isNotificationOpen = $state(false);
	let isSubmitting = $state(false);
	let notifications = $state<
		{
			title: string;
			message: string;
			createdAt: string | Date;
			userId: string;
			[key: string]: unknown;
		}[]
	>([]);
	let unreadCount = $state(0);

	$effect(() => {
		const unsubscribe = sseStore.events.subscribe((events) => {
			const event = events[0]; // Get latest event
			if (event && event.type === 'notification_created') {
				const newNotif = event.data as {
					title: string;
					message: string;
					createdAt: string | Date;
					userId: string;
				};
				// Only show if it belongs to current user
				if (newNotif.userId === user.email || newNotif.userId === 'all') {
					// Needs proper ID check
					notifications = [newNotif, ...notifications];
					unreadCount++;
					toast.info(`New Notification: ${newNotif.title}`);
				}
			}
		});
		return () => unsubscribe();
	});

	// Initial fetch
	$effect(() => {
		if (isNotificationOpen) {
			fetch('/api/notifications')
				.then((r) => r.json())
				.then((data) => {
					notifications = data.notifications;
					unreadCount = 0; // Reset on open? Or keep unread logic
				});
		}
	});
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user.avatar} alt={user.name} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user.avatar} alt={user.name} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<Button onclick={toggleMode} variant="outline" size="icon">
							<Sun
								class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
							/>
							<Moon
								class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Item>
					<Select.Root type="single" bind:value={initialLocale}>
						<Select.Trigger class="w-[90px] font-mono text-xs" size="sm"
							>{#if initialLocale === 'id'}
								<Id class="h-5 w-5" />ID
							{:else if initialLocale === 'en'}
								<GbNir class="h-5 w-5 text-xs" />EN
							{:else}
								<span class="text-gray-500">Bahasa</span>
							{/if}
						</Select.Trigger>
						<Select.Content class="font-mono text-xs">
							<Select.Item value="id"><Id />ID</Select.Item>
							<Select.Item value="en"><GbNir />EN</Select.Item>
						</Select.Content>
					</Select.Root>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<a href={localizeHref(`/panel/user/${user.id}`)} class="flex w-full items-center gap-2">
							<BadgeCheckIcon />
							{m.menu_account()}
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<CreditCardIcon />
						{m.menu_billing()}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => (isNotificationOpen = true)}>
						<div class="relative">
							<BellIcon />
							{#if unreadCount > 0}
								<span
									class="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
								></span>
							{/if}
						</div>
						{m.menu_notifications()}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<Button onclick={() => (isOpenLogout = true)} size="sm" variant="ghost"
						><LogOutIcon /> {m.header_logout()}</Button
					>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>

<!-- Notification Dialog -->
<Dialog.Root bind:open={isNotificationOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m.menu_notifications()}</Dialog.Title>
			<Dialog.Description>You have unread notifications.</Dialog.Description>
		</Dialog.Header>
		<div class="max-h-[300px] overflow-y-auto py-4">
			{#if notifications.length > 0}
				<div class="space-y-4">
					{#each notifications as notif (notif.createdAt)}
						<div class="rounded-lg border p-3 shadow-sm">
							<h4 class="text-sm font-semibold">{notif.title}</h4>
							<p class="text-muted-foreground text-xs">{notif.message}</p>
							<span class="text-muted-foreground mt-2 block text-[10px]"
								>{new Date(notif.createdAt).toLocaleString()}</span
							>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-center text-sm">No notifications.</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
<!-- User logout dialog -->
<Dialog.Root bind:open={isOpenLogout}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">{m.dialog_logout_title()}</Dialog.Title>
			<Dialog.Description>
				{m.dialog_logout_desc()}
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form logout -->
		<form method="POST" action="/api/auth/logout" onsubmit={() => (isSubmitting = true)}>
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenLogout = false)}>
					{m.btn_cancel()}
				</Button>
				{#if isSubmitting}
					<Button disabled variant="destructive">
						<LoaderCircle class="animate-spin" />
						{m.btn_wait()}
					</Button>
				{:else}
					<Button type="submit" variant="destructive">{m.btn_logout()}</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
