<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import PushToggle from '$lib/components/pwa/PushToggle.svelte';
	import UserCircle from '@lucide/svelte/icons/user-circle';
	import Mail from '@lucide/svelte/icons/mail';
	import Shield from '@lucide/svelte/icons/shield';
	import * as m from '$lib/paraglide/messages.js';

	// Placeholder data (ideally from DB via page data)
	let user = {
		name: 'John Doe',
		email: 'john@example.com',
		role: 'Administrator'
	};
</script>

<div class="container mx-auto max-w-2xl p-4 md:p-8">
	<h1 class="mb-6 text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
		{m.profile_settings_title()}
	</h1>

	<!-- Profile Info -->
	<Card.Root class="mb-6">
		<Card.Header>
			<div class="flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
				>
					<UserCircle class="h-8 w-8 text-slate-500" />
				</div>
				<div>
					<Card.Title>{user.name}</Card.Title>
					<Card.Description>{user.role}</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
					<Mail class="h-4 w-4" />
					<span>{user.email}</span>
				</div>
				<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
					<Shield class="h-4 w-4" />
					<span>{m.profile_permissions()}: {m.profile_permissions_all()}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Notifications -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{m.profile_notifications_section()}</Card.Title>
			<Card.Description>{m.profile_notifications_desc()}</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div
				class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
			>
				<div class="space-y-0.5">
					<div class="text-sm font-medium text-slate-900 dark:text-slate-100">
						{m.profile_push_notifications()}
					</div>
					<div class="text-xs text-slate-500 dark:text-slate-400">
						{m.profile_push_notifications_desc()}
					</div>
				</div>
				<PushToggle />
			</div>

			<div
				class="flex cursor-not-allowed items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 opacity-60 dark:border-slate-800 dark:bg-slate-900/50"
			>
				<div class="space-y-0.5">
					<div class="text-sm font-medium text-slate-900 dark:text-slate-100">
						{m.profile_email_notifications()}
					</div>
					<div class="text-xs text-slate-500 dark:text-slate-400">
						{m.profile_email_notifications_desc()}
					</div>
				</div>
				<Button variant="outline" size="sm" disabled>{m.profile_coming_soon()}</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- App Info -->
	<div class="mt-8 text-center text-xs text-slate-400">
		<p>{m.profile_app_version()}</p>
	</div>
</div>
