<script lang="ts">
	import { untrack } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import { salaryComponentSchema, type SalaryComponentSchema } from '$lib/schemas/salary-component';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { SalaryComponent } from '$lib/types';

	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';

	let {
		data
	}: {
		data: {
			components: SalaryComponent[];
			form: SuperValidated<Infer<SalaryComponentSchema>>;
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(salaryComponentSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Salary component created successfully');
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to create salary component');
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);

	const pages = {
		title: 'Salary Components',
		excerpt: 'Manage allowances and deductions.'
	};

	let selectedType = $derived({
		label: $formData.type === 'allowance' ? 'Allowance' : 'Deduction',
		value: $formData.type
	});

	let selectedCalcType = $derived({
		label: $formData.calculationType === 'fixed' ? 'Fixed Amount' : 'Percentage',
		value: $formData.calculationType
	});
</script>

<svelte:head>
	<title>{pages.title}</title>
	<meta name="description" content={pages.excerpt} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{pages.title}
			</h2>
			<p class="text-muted-foreground">
				You have {data?.components.length} component(s)
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"
				><Plus /> Add Component</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable data={data?.components} columns={createColumns(data?.formDestroy, data.form)} />
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Add Salary Component</Dialog.Title>
			<Dialog.Description>Add a new allowance or deduction component.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} placeholder="Meal Allowance" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="type">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Type</Form.Label>
							<Select.Root type="single" bind:value={$formData.type} name={props.name}>
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

				<Form.Field {form} name="calculationType">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Calculation</Form.Label>
							<Select.Root type="single" bind:value={$formData.calculationType} name={props.name}>
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

			<Form.Field {form} name="defaultAmount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Default Amount / Percentage</Form.Label>
						<Input
							{...props}
							type="number"
							step="0.01"
							bind:value={$formData.defaultAmount}
							placeholder="0.00"
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field
				{form}
				name="isActive"
				class="flex flex-row items-center justify-between rounded-lg border p-4"
			>
				<div class="space-y-0.5">
					<Form.Label>Active</Form.Label>
					<Form.Description>Enable or disable this component.</Form.Description>
				</div>
				<Form.Control>
					{#snippet children({ props })}
						<Switch {...props} bind:checked={$formData.isActive} />
					{/snippet}
				</Form.Control>
			</Form.Field>

			<div class="mt-4">
				{#if $delayed}
					<Form.Button disabled class="flex w-full justify-center">
						<LoaderCircle class="animate-spin" />
						Please wait
					</Form.Button>
				{:else}
					<Form.Button class="flex w-full justify-center">Save</Form.Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
