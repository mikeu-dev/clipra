<script lang="ts">
	import { untrack } from 'svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let isDialogOpen = $state(false);
	let editingId = $state<string | null>(null);

	const { form, errors, enhance, reset, delayed } = superForm(
		untrack(() => data.form),
		{
			resetForm: true,
			onResult: ({ result }) => {
				if (result.type === 'success') {
					isDialogOpen = false;
					editingId = null;
					toast.success(editingId ? 'Warehouse updated' : 'Warehouse created');
				}
			}
		}
	);

	function openCreate() {
		reset();
		editingId = null;
		isDialogOpen = true;
	}

	function openEdit(warehouse: (typeof data.warehouses)[number]) {
		reset();
		$form.id = warehouse.id;
		$form.name = warehouse.name;
		$form.code = warehouse.code;
		$form.address = warehouse.address || '';
		$form.latitude = warehouse.latitude || '';
		$form.longitude = warehouse.longitude || '';
		editingId = warehouse.id;
		isDialogOpen = true;
	}
</script>

<header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
	<div class="flex items-center gap-2 px-4">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/panel">Panel</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Page>Warehouses</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Warehouses</h2>
			<p class="text-muted-foreground">Manage your physical storage locations.</p>
		</div>
		<Button onclick={openCreate}>
			<Plus class="mr-2 h-4 w-4" />
			Add Warehouse
		</Button>
	</div>

	<Separator />

	<div class="bg-card text-card-foreground rounded-md border shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Code</Table.Head>
					<Table.Head>Address</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.warehouses as warehouse (warehouse.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{warehouse.name}</Table.Cell>
						<Table.Cell>{warehouse.code}</Table.Cell>
						<Table.Cell>{warehouse.address || '-'}</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button variant="outline" size="icon" onclick={() => openEdit(warehouse)}>
									<Pencil class="h-4 w-4" />
								</Button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={warehouse.id} />
									<Button variant="destructive" size="icon" type="submit">
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No warehouses found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Warehouse' : 'Add Warehouse'}</Dialog.Title>
			<Dialog.Description>Fill in the details for your physical warehouse.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/save" use:enhance class="space-y-4">
			<input type="hidden" name="id" bind:value={$form.id} />
			<div class="space-y-2">
				<Label for="name">Warehouse Name</Label>
				<Input id="name" name="name" bind:value={$form.name} placeholder="e.g. Main Warehouse" />
				{#if $errors.name}<p class="text-destructive text-sm">{$errors.name}</p>{/if}
			</div>
			<div class="space-y-2">
				<Label for="code">Warehouse Code</Label>
				<Input id="code" name="code" bind:value={$form.code} placeholder="e.g. WH-01" />
				{#if $errors.code}<p class="text-destructive text-sm">{$errors.code}</p>{/if}
			</div>
			<div class="space-y-2">
				<Label for="address">Address</Label>
				<Textarea
					id="address"
					name="address"
					bind:value={$form.address}
					placeholder="Warehouse address..."
				/>
				{#if $errors.address}<p class="text-destructive text-sm">{$errors.address}</p>{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="latitude">Latitude</Label>
					<Input
						id="latitude"
						name="latitude"
						bind:value={$form.latitude}
						placeholder="e.g. -6.1754"
					/>
					{#if $errors.latitude}<p class="text-destructive text-sm">{$errors.latitude}</p>{/if}
				</div>
				<div class="space-y-2">
					<Label for="longitude">Longitude</Label>
					<Input
						id="longitude"
						name="longitude"
						bind:value={$form.longitude}
						placeholder="e.g. 106.8272"
					/>
					{#if $errors.longitude}<p class="text-destructive text-sm">{$errors.longitude}</p>{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={$delayed}>
					{editingId ? 'Save Changes' : 'Create Warehouse'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
