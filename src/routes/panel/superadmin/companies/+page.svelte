<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import 'filepond/dist/filepond.min.css';
	import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	let { data } = $props();
	let isCreating = $state(false);
	let logoServerId = $state('');

	// Define a type for the FilePond file object relevant to this callback
	type FilePondFile = {
		serverId: string | null;
		// Add other properties if needed, e.g., id, filename, file, etc.
	};

	function handleProcessFile(error: Error | null, file: FilePondFile) {
		if (!error && file.serverId) {
			logoServerId = file.serverId;
		}
	}

	function handleRemoveFile() {
		logoServerId = '';
	}

	const filePondServer = {
		process: '/api/file/upload',
		revert: null
	};

	import type { ActionResult } from '@sveltejs/kit';

	function handleResult({ result }: { result: ActionResult }) {
		if (result.type === 'success') {
			toast.success(m.toast_success_company_processed());
			isCreating = false;
		} else if (result.type === 'failure') {
			toast.error(result.data?.error || 'Failed to process company');
		}
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Tenant Management
		</h1>
		<Button onclick={() => (isCreating = !isCreating)}>
			<Plus class="mr-2 h-4 w-4" />
			Add Tenant
		</Button>
	</div>

	{#if isCreating}
		<Card.Root>
			<Card.Header>
				<Card.Title>Create New Tenant</Card.Title>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/create"
					enctype="multipart/form-data"
					use:enhance={() => handleResult}
					class="space-y-4"
				>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="name">Company Name</Label>
							<Input id="name" name="name" required placeholder="e.g. Acme Corp" />
						</div>
						<div class="space-y-2">
							<Label for="slug">Slug</Label>
							<Input id="slug" name="slug" required placeholder="e.g. acme-corp" />
						</div>
						<div class="space-y-2">
							<Label for="code">Company Code</Label>
							<Input id="code" name="code" required placeholder="e.g. ACME-001" />
						</div>
						<div class="space-y-2">
							<Label for="email">Contact Email</Label>
							<Input id="email" name="email" type="email" placeholder="admin@acme.com" />
						</div>
						<div class="col-span-2 space-y-2">
							<Label for="logo">Company Logo (Optional)</Label>
							<FilePond
								name="logoFile"
								server={filePondServer}
								acceptedFileTypes={['image/*']}
								onprocessfile={handleProcessFile}
								onremovefile={handleRemoveFile}
								labelIdle="Seret logo ke sini atau <span class='filepond--label-action'>Pilih Gambar</span>"
							/>
							<input type="hidden" name="logo" value={logoServerId} />
						</div>
					</div>
					<div class="flex justify-end gap-2">
						<Button variant="outline" type="button" onclick={() => (isCreating = false)}
							>Cancel</Button
						>
						<Button type="submit">Create Tenant</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Logo</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Code</Table.Head>
						<Table.Head>Slug</Table.Head>
						<Table.Head>Created At</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.companies as company (company.id)}
						<Table.Row>
							<Table.Cell>
								{#if company.logo}
									<img
										src={company.logo}
										alt={company.name}
										class="h-8 w-8 rounded-full object-cover"
									/>
								{:else}
									<div
										class="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
									>
										{company.name.substring(0, 2).toUpperCase()}
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell class="font-medium">{company.name}</Table.Cell>
							<Table.Cell>{company.code}</Table.Cell>
							<Table.Cell>{company.slug}</Table.Cell>
							<Table.Cell
								>{company.createdAt
									? new Date(company.createdAt).toLocaleDateString()
									: '-'}</Table.Cell
							>
							<Table.Cell class="text-right">
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => handleResult}
									class="inline"
								>
									<input type="hidden" name="id" value={company.id} />
									<Button
										variant="ghost"
										size="icon"
										type="submit"
										class="text-red-500 hover:text-red-700"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.companies.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="text-muted-foreground text-center"
								>No tenants found.</Table.Cell
							>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
