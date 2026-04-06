<script lang="ts">
	import { untrack } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';

	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { clientSchema } from '$lib/schemas/client';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// Superform setup
	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(clientSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(isEditMode ? m.msg_client_updated() : m.msg_client_created());
					isDialogOpen = false;
					goto(localizeHref('/panel/client'), { invalidateAll: true });
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.msg_operation_failed());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isDialogOpen = $state(false);
	let isEditMode = $state(false);
	let isDeleteDialogOpen = $state(false);
	let clientToDelete = $state('');

	// Permissions
	const canCreate = ['admin', 'manager', 'director'].some((r) =>
		data.userRole?.toLowerCase().includes(r)
	);

	let search = $state($page.url.searchParams.get('search') || '');
	let typingTimer: any; // eslint-disable-line @typescript-eslint/no-explicit-any

	function handleSearch(value: string) {
		search = value;
		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (value) url.searchParams.set('search', value);
			else url.searchParams.delete('search');
			url.searchParams.set('page', '1'); // Reset to page 1
			goto(localizeHref(url.toString()));
		}, 500);
	}

	function openCreate() {
		isEditMode = false;
		form.reset();
		isDialogOpen = true;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function openEdit(client: any) {
		isEditMode = true;
		$formData.id = client.id;
		$formData.name = client.name;
		$formData.contactEmail = client.contactEmail || '';
		$formData.phone = client.phone || '';
		$formData.latitude = client.latitude || '';
		$formData.longitude = client.longitude || '';
		isDialogOpen = true;
	}

	function confirmDelete(id: string) {
		clientToDelete = id;
		isDeleteDialogOpen = true;
	}
</script>

<svelte:head>
	<title>{m.client_title()}</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.client_title()}
			</h2>
			<p class="text-muted-foreground">{m.client_desc()}</p>
		</div>
		<div class="flex items-center gap-2">
			<div class="relative w-full md:w-64">
				<Search class="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					placeholder={m.placeholder_search_clients()}
					class="pl-8"
					value={search}
					oninput={(e) => handleSearch(e.currentTarget.value)}
				/>
			</div>
			{#if canCreate}
				<Button onclick={openCreate}><Plus class="mr-2 h-4 w-4" /> {m.btn_new_client()}</Button>
			{/if}
		</div>
	</div>

	{#if data.clients.length === 0}
		<div
			class="flex h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center"
		>
			<div class="bg-muted rounded-full p-3">
				<Building2 class="text-muted-foreground h-6 w-6" />
			</div>
			<h3 class="text-lg font-semibold">{m.msg_no_clients()}</h3>
			<p class="text-muted-foreground text-sm">
				{search ? m.msg_no_clients_search() : m.msg_no_clients_new()}
			</p>
			{#if canCreate && !search}
				<Button class="mt-4" onclick={openCreate}
					><Plus class="mr-2 h-4 w-4" /> {m.btn_create_client()}</Button
				>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.clients as client (client.id)}
				<Card.Root class="hover:border-primary/50 group relative h-full transition-colors">
					<Card.Header>
						<div class="flex items-start justify-between">
							<a href={localizeHref(`/panel/client/${client.id}`)} class="block flex-1">
								<Card.Title class="group-hover:text-primary flex items-center gap-2">
									<Building2 class="h-5 w-5" />
									{client.name}
								</Card.Title>
								<Card.Description class="mt-2 space-y-1">
									{#if client.contactEmail}
										<div class="flex items-center gap-2 text-xs">
											<Mail class="h-3 w-3" />
											<span class="truncate">{client.contactEmail}</span>
										</div>
									{/if}
									{#if client.phone}
										<div class="flex items-center gap-2 text-xs">
											<Phone class="h-3 w-3" />
											<span>{client.phone}</span>
										</div>
									{/if}
									{#if !client.contactEmail && !client.phone}
										<span class="text-xs italic">{m.label_no_contact()}</span>
									{/if}
								</Card.Description>
							</a>

							{#if canCreate}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="-mr-2 h-8 w-8">
												<EllipsisVertical class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => openEdit(client)}>
											<Pencil class="mr-2 h-4 w-4" />
											{m.action_edit()}
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="text-destructive focus:text-destructive"
											onclick={() => confirmDelete(client.id)}
										>
											<Trash2 class="mr-2 h-4 w-4" />
											{m.action_delete()}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{/if}
						</div>
					</Card.Header>
					<Card.Footer class="border-t pt-4">
						<div class="text-muted-foreground flex w-full items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<FolderGit2 class="h-4 w-4" />
								<span>
									{client.projects?.length || 0}
									{client.projects?.length === 1 ? m.label_project() : m.label_projects()}
								</span>
							</div>
							{#if client.projects?.length > 0}
								<Badge variant="secondary">{client.projects.length}</Badge>
							{/if}
						</div>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		<div class="mt-4 flex justify-center">
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={data.page <= 1}
					onclick={() => goto(localizeHref(`?page=${data.page - 1}`))}>{m.btn_previous()}</Button
				>
				<span class="text-muted-foreground flex items-center text-sm"
					>{m.label_page()} {data.page}</span
				>
				<Button
					variant="outline"
					size="sm"
					disabled={data.clients.length < data.limit}
					onclick={() => goto(localizeHref(`?page=${data.page + 1}`))}>{m.btn_next()}</Button
				>
			</div>
		</div>
	{/if}
</div>

<!-- Create/Edit Client Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? m.dialog_edit_client() : m.dialog_create_client()}</Dialog.Title>
			<Dialog.Description>
				{isEditMode ? m.dialog_edit_client_desc() : m.dialog_create_client_desc()}
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action={isEditMode ? '?/update' : '?/create'}
			use:enhance
			class="grid gap-4 py-4"
		>
			{#if isEditMode}
				<input type="hidden" name="id" value={$formData.id} />
			{/if}

			<Form.Field {form} name="name">
				<Label>{m.label_client_name()} <span class="text-destructive">*</span></Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.name}
							placeholder={m.placeholder_client_name()}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="contactEmail">
				<Label>{m.label_contact_email()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							type="email"
							{...props}
							bind:value={$formData.contactEmail}
							placeholder="contact@example.com"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="phone">
				<Label>{m.label_phone()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input {...props} bind:value={$formData.phone} placeholder="+62 812 3456 7890" />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="latitude">
					<Label>Latitude</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input {...props} bind:value={$formData.latitude} placeholder="-6.1754" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="longitude">
					<Label>Longitude</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input {...props} bind:value={$formData.longitude} placeholder="106.8272" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="flex justify-end pt-4">
				{#if $delayed}
					<Button disabled>
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{isEditMode ? m.btn_updating() : m.btn_creating()}
					</Button>
				{:else}
					<Button type="submit"
						>{isEditMode ? m.btn_update() : m.btn_create()} {m.label_client()}</Button
					>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.dialog_delete_client_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.dialog_delete_client_desc()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={clientToDelete} />
				<Button variant="destructive" type="submit" onclick={() => (isDeleteDialogOpen = false)}>
					{m.action_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
