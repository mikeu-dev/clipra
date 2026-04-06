<script lang="ts" module>
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
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { IdSchema } from '$lib/schemas/destroy';
	import { salaryComponentSchema, type SalaryComponentSchema } from '$lib/schemas/salary-component';
	import type { SalaryComponent } from '$lib/types';

	let {
		component,
		formDestroy,
		formEdit
	}: {
		component: SalaryComponent;
		formDestroy: SuperValidated<Infer<IdSchema>>;
		formEdit: SuperValidated<Infer<SalaryComponentSchema>>;
	} = $props();

	// Delete Form
	const destroyForm = superForm(
		untrack(() => formDestroy),
		{
			resetForm: true,
			id: untrack(() => `destroy-form-${component.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Component deleted successfully');
					isOpenDestroy = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to delete component');
				}
			}
		}
	);
	const { enhance: enhanceDestroy, delayed: delayedDestroy } = destroyForm;

	// Edit Form
	const editForm = superForm(
		untrack(() => formEdit),
		{
			validators: zodClient(salaryComponentSchema),
			resetForm: false,
			id: untrack(() => `edit-form-${component.id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Component updated successfully');
					isOpenEdit = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to update component');
				}
			}
		}
	);
	const { form: editData, enhance: enhanceEdit, delayed: delayedEdit } = editForm;

	let isOpenDestroy = $state(false);
	let isOpenEdit = $state(false);

	function openEdit() {
		$editData.id = component.id;
		$editData.name = component.name ?? '';
		$editData.type = component.type as 'allowance' | 'deduction';
		$editData.calculationType = component.calculationType as 'fixed' | 'percentage';
		$editData.defaultAmount = String(component.defaultAmount);
		$editData.isActive = !!component.isActive;
		isOpenEdit = true;
	}

	let selectedType = $derived({
		label: $editData.type === 'allowance' ? 'Allowance' : 'Deduction',
		value: $editData.type
	});

	let selectedCalcType = $derived({
		label: $editData.calculationType === 'fixed' ? 'Fixed Amount' : 'Percentage',
		value: $editData.calculationType
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
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Component Edit Dialog -->
<Dialog.Root bind:open={isOpenEdit}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Edit Salary Component</Dialog.Title>
			<Dialog.Description>Update the salary component details.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/update" use:enhanceEdit>
			<input type="hidden" name="id" bind:value={$editData.id} />
			<Form.Field form={editForm} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$editData.name} placeholder="Meal Allowance" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field form={editForm} name="type">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Type</Form.Label>
							<Select.Root type="single" bind:value={$editData.type} name={props.name}>
								<Select.Trigger {...props}>
									{selectedType.label}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="allowance" label="Allowance">Allowance</Select.Item>
									<Select.Item value="deduction" label="Deduction">Deduction</Select.Item>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={editForm} name="calculationType">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Calculation</Form.Label>
							<Select.Root type="single" bind:value={$editData.calculationType} name={props.name}>
								<Select.Trigger {...props}>
									{selectedCalcType.label}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="fixed" label="Fixed Amount">Fixed Amount</Select.Item>
									<Select.Item value="percentage" label="Percentage">Percentage</Select.Item>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field form={editForm} name="defaultAmount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Default Amount / Percentage</Form.Label>
						<Input
							{...props}
							type="number"
							step="0.01"
							bind:value={$editData.defaultAmount}
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				form={editForm}
				name="isActive"
				class="flex flex-row items-center justify-between rounded-lg border p-4"
			>
				<div class="space-y-0.5">
					<Form.Label>Active</Form.Label>
				</div>
				<Form.Control>
					{#snippet children({ props })}
						<Switch {...props} bind:checked={$editData.isActive} />
					{/snippet}
				</Form.Control>
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

<!-- Component Delete Dialog -->
<Dialog.Root bind:open={isOpenDestroy}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Delete component</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this salary component?
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/destroy" use:enhanceDestroy>
			<input type="hidden" name="id" value={component.id} />

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
