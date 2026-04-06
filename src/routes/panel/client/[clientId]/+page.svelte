<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Separator } from '$lib/components/ui/separator';

	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
	let client = $derived(data.client);

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.substring(0, 2)
			.toUpperCase();
	}
</script>

<svelte:head>
	<title>{client.name} - {m.client_title()}</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/panel/client">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			{m.title_client_detail()}
		</h2>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<!-- Client Info Card -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<div class="flex items-center gap-4">
					<Avatar.Root class="h-16 w-16">
						<Avatar.Fallback class="text-lg">{getInitials(client.name)}</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<Card.Title class="text-2xl">{client.name}</Card.Title>
						<Card.Description>ID: {client.id}</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class="grid gap-1">
					<div class="text-muted-foreground flex items-center gap-2 text-sm">
						<Mail class="h-4 w-4" />
						<span>{m.label_email()}</span>
					</div>
					<div class="font-medium">{client.contactEmail || '-'}</div>
				</div>
				<Separator />
				<div class="grid gap-1">
					<div class="text-muted-foreground flex items-center gap-2 text-sm">
						<Phone class="h-4 w-4" />
						<span>{m.label_phone()}</span>
					</div>
					<div class="font-medium">{client.phone || '-'}</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Actions / Stats Card -->
		<Card.Root>
			<Card.Header>
				<Card.Title>{m.label_quick_actions()}</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				<Button class="w-full" href={`/panel/project?client=${client.id}`}>
					<FolderGit2 class="mr-2 h-4 w-4" />
					{m.btn_view_projects()}
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</div>
