<script lang="ts">
	import { untrack } from 'svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Search from '@lucide/svelte/icons/search';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let isDialogOpen = $state(false);
	let editingId = $state<string | null>(null);
	let searchQuery = $state('');
	let warehouseFilter = $state('all');

	const { form, errors, enhance, reset, delayed } = superForm(
		untrack(() => data.form),
		{
			resetForm: true,
			onResult: ({ result }) => {
				if (result.type === 'success') {
					isDialogOpen = false;
					editingId = null;
					toast.success(editingId ? 'Location updated' : 'Location created');
				}
			}
		}
	);

	function openCreate() {
		reset();
		editingId = null;
		isDialogOpen = true;
	}

	function openEdit(location: (typeof data.locations)[number]) {
		reset();
		$form.id = location.id;
		$form.name = location.name;
		$form.warehouseId = location.warehouseId;
		$form.usage = location.usage || 'internal';
		editingId = location.id;
		isDialogOpen = true;
	}

	const usages = [
		{
			value: 'internal',
			label: 'Internal Location',
			color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
		},
		{
			value: 'supplier',
			label: 'Supplier Location',
			color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
		},
		{
			value: 'view',
			label: 'View (Virtual)',
			color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
		},
		{
			value: 'customer',
			label: 'Customer Location',
			color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
		},
		{
			value: 'inventory',
			label: 'Inventory Loss',
			color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
		},
		{
			value: 'production',
			label: 'Production',
			color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
		},
		{
			value: 'transit',
			label: 'Transit Location',
			color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
		}
	];

	let filteredLocations = $derived(
		data.locations.filter((l: (typeof data.locations)[number]) => {
			const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesWarehouse = warehouseFilter === 'all' || l.warehouseId === warehouseFilter;
			return matchesSearch && matchesWarehouse;
		})
	);
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
					<Breadcrumb.Page>Locations</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Locations</h2>
			<p class="text-muted-foreground">
				Manage shelves, zones, and specific areas within your warehouses.
			</p>
		</div>
		<Button onclick={openCreate}>
			<Plus class="mr-2 h-4 w-4" />
			Add Location
		</Button>
	</div>

	<Separator />

	<div class="flex flex-col gap-4 md:flex-row md:items-center">
		<div class="relative flex-1">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input placeholder="Search location name..." class="pl-10" bind:value={searchQuery} />
		</div>
		<div class="w-full md:w-64">
			<Select.Root type="single" bind:value={warehouseFilter}>
				<Select.Trigger class="w-full">
					{data.warehouses.find((w: (typeof data.warehouses)[number]) => w.id === warehouseFilter)
						?.name || 'All Warehouses'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Warehouses</Select.Item>
					{#each data.warehouses as warehouse (warehouse.id)}
						<Select.Item value={warehouse.id} label={warehouse.name} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="bg-card text-card-foreground overflow-hidden rounded-md border shadow-sm">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Status</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Warehouse</Table.Head>
					<Table.Head>Type/Usage</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredLocations as location (location.id)}
					<Table.Row class={!location.isActive ? 'opacity-50 grayscale-[0.5]' : ''}>
						<Table.Cell>
							<form method="POST" action="?/toggleActive">
								<input type="hidden" name="id" value={location.id} />
								<input type="hidden" name="isActive" value={location.isActive} />
								<button type="submit" class="focus:outline-none">
									{#if location.isActive}
										<CheckCircle2
											class="h-5 w-5 text-green-500 transition-colors hover:text-green-600"
										/>
									{:else}
										<XCircle
											class="text-muted-foreground hover:text-destructive h-5 w-5 transition-colors"
										/>
									{/if}
								</button>
							</form>
						</Table.Cell>
						<Table.Cell class="font-medium">{location.name}</Table.Cell>
						<Table.Cell>{location.warehouseName}</Table.Cell>
						<Table.Cell>
							<Badge
								variant="secondary"
								class={cn('font-medium', usages.find((u) => u.value === location.usage)?.color)}
							>
								{usages.find((u) => u.value === location.usage)?.label || location.usage}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="outline"
									size="icon"
									onclick={() => openEdit(location)}
									title="Edit"
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={location.id} />
									<Button variant="destructive" size="icon" type="submit" title="Delete">
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="h-32 text-center text-muted-foreground italic">
							No locations found matching your criteria.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Location' : 'Add Location'}</Dialog.Title>
			<Dialog.Description>Assign a name and warehouse to this specific area.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/save" use:enhance class="space-y-4">
			<input type="hidden" name="id" bind:value={$form.id} />
			<div class="space-y-2">
				<Label for="name">Location Name</Label>
				<Input id="name" name="name" bind:value={$form.name} placeholder="e.g. Shelf A-101" />
				{#if $errors.name}<p class="text-destructive text-sm">{$errors.name}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label>Warehouse</Label>
				<Select.Root type="single" bind:value={$form.warehouseId} name="warehouseId">
					<Select.Trigger class="w-full">
						{data.warehouses.find(
							(w: (typeof data.warehouses)[number]) => w.id === $form.warehouseId
						)?.name || 'Select Warehouse'}
					</Select.Trigger>
					<Select.Content>
						{#each data.warehouses as warehouse (warehouse.id)}
							<Select.Item value={warehouse.id} label={warehouse.name} />
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.warehouseId}<p class="text-destructive text-sm">{$errors.warehouseId}</p>{/if}
			</div>

			<div class="space-y-2">
				<Label>Usage Type</Label>
				<Select.Root type="single" bind:value={$form.usage} name="usage">
					<Select.Trigger class="w-full">
						{usages.find((u) => u.value === $form.usage)?.label || 'Select Usage'}
					</Select.Trigger>
					<Select.Content>
						{#each usages as usage (usage.value)}
							<Select.Item value={usage.value} label={usage.label} />
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.usage}<p class="text-destructive text-sm">{$errors.usage}</p>{/if}
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={$delayed}>
					{editingId ? 'Save Changes' : 'Create Location'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
