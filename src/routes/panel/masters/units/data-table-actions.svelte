<script lang="ts" module>
	import * as m from '$lib/paraglide/messages.js';

	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { IdSchema } from '$lib/schemas/destroy';
	import { unitSchema, type UnitSchema } from '$lib/schemas/unit';
	import type { Unit, User } from '$lib/types';

	let {
		unit,
		formDestroy,
		formEdit,
		users
	}: {
		unit: Unit;
		formDestroy: SuperValidated<Infer<IdSchema>>;
		formEdit: SuperValidated<Infer<UnitSchema>>;
		users: User[];
	} = $props();

	// Delete Form
	const destroyForm = superForm(
		untrack(() => formDestroy),
		{
			resetForm: true,
			id: untrack(() => `destroy-form-${unit.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_unit_deleted());
					isOpenDestroy = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to delete Unit');
				}
			}
		}
	);
	const { enhance: enhanceDestroy, delayed: delayedDestroy } = destroyForm;

	// Edit Form
	const editForm = superForm(
		untrack(() => formEdit),
		{
			validators: zodClient(unitSchema),
			resetForm: false,
			id: untrack(() => `edit-form-${unit.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_unit_updated());
					isOpenEdit = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to update unit');
				}
			}
		}
	);
	const { form: editData, enhance: enhanceEdit, delayed: delayedEdit } = editForm;

	let isOpenDestroy = $state(false);
	let isOpenEdit = $state(false);

	// Pre-fill edit form when dialog opens
	function openEdit() {
		$editData.id = unit.id;
		$editData.name = unit.name ?? '';
		$editData.userId = unit.userId ?? '';
		isOpenEdit = true;
	}

	let selectedUser = $derived({
		label: users.find((u) => u.id === $editData.userId)?.name ?? 'Select unit manager',
		value: $editData.userId
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item onclick={openEdit}>
				<Pencil class="mr-2 size-4" /> Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => (isOpenDestroy = true)} class="text-destructive">
				<Trash2 class="mr-2 size-4" /> Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Unit Edit Dialog -->
<Dialog.Root bind:open={isOpenEdit}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Edit Unit</Dialog.Title>
			<Dialog.Description>Update the organizational unit details.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/update" use:enhanceEdit>
			<input type="hidden" name="id" bind:value={$editData.id} />
			<Form.Field form={editForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit Name</Form.Label>
						<Input {...props} bind:value={$editData.name} placeholder="Finance Unit" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={editForm} name="userId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit Manager</Form.Label>
						<Select.Root type="single" bind:value={$editData.userId} name={props.name}>
							<Select.Trigger {...props}>
								{selectedUser.label}
							</Select.Trigger>
							<Select.Content>
								{#each users as user (user.id)}
									<Select.Item value={user.id} label={user.name ?? ''}>
										{user.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="mt-4 flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenEdit = false)}>Cancel</Button>
				{#if $delayedEdit}
					<Button disabled>
						<LoaderCircle class="mr-2 size-4 animate-spin" />
						Saving...
					</Button>
				{:else}
					<Button type="submit">Save Changes</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Unit delete dialog -->
<Dialog.Root bind:open={isOpenDestroy}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Delete unit</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this unit? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form delete -->
		<form method="POST" action="?/destroy" use:enhanceDestroy>
			<input type="hidden" name="id" value={unit.id} />

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenDestroy = false)}>
					Cancel
				</Button>
				{#if $delayedDestroy}
					<Button disabled variant="destructive">
						<LoaderCircle class="animate-spin" />
						Please wait
					</Button>
				{:else}
					<Button type="submit" variant="destructive">Delete</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
