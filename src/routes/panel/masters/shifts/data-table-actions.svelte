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
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { IdSchema } from '$lib/schemas/destroy';
	import { shiftSchema, type ShiftSchema } from '$lib/schemas/shift';
	import type { Shift } from '$lib/types';

	let {
		shift,
		formDestroy,
		formEdit
	}: {
		shift: Shift;
		formDestroy: SuperValidated<Infer<IdSchema>>;
		formEdit: SuperValidated<Infer<ShiftSchema>>;
	} = $props();

	// Delete Form
	const destroyForm = superForm(
		untrack(() => formDestroy),
		{
			resetForm: true,
			id: untrack(() => `destroy-form-${shift.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_shift_deleted());
					isOpenDestroy = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to delete Shift');
				}
			}
		}
	);
	const { enhance: enhanceDestroy, delayed: delayedDestroy } = destroyForm;

	// Edit Form
	const editForm = superForm(
		untrack(() => formEdit),
		{
			validators: zodClient(shiftSchema),
			resetForm: false,
			id: untrack(() => `edit-form-${shift.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_shift_updated());
					isOpenEdit = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to update shift');
				}
			}
		}
	);
	const { form: editData, enhance: enhanceEdit, delayed: delayedEdit } = editForm;

	let isOpenDestroy = $state(false);
	let isOpenEdit = $state(false);

	function openEdit() {
		$editData.id = shift.id;
		$editData.name = shift.name ?? '';
		isOpenEdit = true;
	}
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

<!-- Shift Edit Dialog -->
<Dialog.Root bind:open={isOpenEdit}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Edit Shift</Dialog.Title>
			<Dialog.Description>Update the shift name.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/update" use:enhanceEdit>
			<input type="hidden" name="id" bind:value={$editData.id} />
			<Form.Field form={editForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Shift Name</Form.Label>
						<Input {...props} bind:value={$editData.name} placeholder="Morning Shift" required />
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

<!-- Shift delete dialog -->
<Dialog.Root bind:open={isOpenDestroy}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Delete shift</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this shift? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form delete -->
		<form method="POST" action="?/destroy" use:enhanceDestroy>
			<input type="hidden" name="id" value={shift.id} />

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
