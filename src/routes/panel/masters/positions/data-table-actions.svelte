<script lang="ts" module>
	import * as m from '$lib/paraglide/messages.js';

	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
</script>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { idSchema } from '$lib/schemas/destroy';
	import { positionSchema, type PositionSchema } from '$lib/schemas/position';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { IdSchema as TIdSchema } from '$lib/schemas/destroy';
	import type { Position } from '$lib/types';

	let {
		position,
		formDestroy,
		formEdit
	}: {
		position: Position;
		formDestroy: SuperValidated<Infer<TIdSchema>>;
		formEdit: SuperValidated<Infer<PositionSchema>>;
	} = $props();

	let openDelete = $state(false);
	let openEdit = $state(false);

	// Delete Form
	const deleteForm = superForm(
		untrack(() => formDestroy),
		{
			validators: zodClient(idSchema),
			id: untrack(() => `delete-form-${position.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_deleted());
					openDelete = false;
				} else {
					toast.error(m.toast_error_failed_delete());
				}
			}
		}
	);

	const { enhance: enhanceDelete, delayed: delayedDelete } = deleteForm;

	// Edit Form
	const editForm = superForm(
		untrack(() => formEdit),
		{
			validators: zodClient(positionSchema),
			id: untrack(() => `edit-form-${position.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_updated());
					openEdit = false;
				} else {
					toast.error(m.toast_error_failed_update());
				}
			}
		}
	);

	const { form: editData, enhance: enhanceEdit, delayed: delayedEdit } = editForm;

	function handleOpenEdit() {
		$editData.id = position.id;
		$editData.name = position.name;
		openEdit = true;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item onclick={handleOpenEdit}>
				<Pencil class="mr-2 size-4" /> Edit
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => (openDelete = true)} class="text-destructive">
				<Trash2 class="mr-2 size-4" /> Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Edit Dialog -->
<Dialog.Root bind:open={openEdit}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Position</Dialog.Title>
			<Dialog.Description>Update the position name.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/update" use:enhanceEdit>
			<input type="hidden" name="id" bind:value={$editData.id} />
			<Form.Field form={editForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$editData.name} required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="mt-4 flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (openEdit = false)}>Cancel</Button>
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

<!-- Delete Dialog -->
<Dialog.Root bind:open={openDelete}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete the position.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<form method="POST" action="?/destroy" use:enhanceDelete>
				<input type="hidden" name="id" value={position.id} />
				<Button type="button" variant="outline" onclick={() => (openDelete = false)}>Cancel</Button>
				{#if $delayedDelete}
					<Button disabled>
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						Please wait
					</Button>
				{:else}
					<Button type="submit" variant="destructive">Delete</Button>
				{/if}
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
