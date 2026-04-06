<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { untrack } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { shiftSchema, type ShiftSchema } from '$lib/schemas/shift';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { Shift } from '$lib/types';

	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';

	let {
		data
	}: {
		data: {
			shifts: Shift[];
			form: SuperValidated<Infer<ShiftSchema>>;
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(shiftSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_shift_created());
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to create shift');
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);

	const pages = {
		title: 'Shifts',
		excerpt: 'Manage work shifts.'
	};
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
				You have {data?.shifts.length} shift(s)
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"><Plus /> Add Shift</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable data={data?.shifts} columns={createColumns(data?.formDestroy, data.form)} />
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Add Shift</Dialog.Title>
			<Dialog.Description>Add a new work shift.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Shift Name</Form.Label>
						<Input {...props} bind:value={$formData.name} placeholder="Morning Shift" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
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
