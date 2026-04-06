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
	import * as Select from '$lib/components/ui/select';
	import { unitSchema, type UnitSchema } from '$lib/schemas/unit';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { Unit, User } from '$lib/types';

	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';

	let {
		data
	}: {
		data: {
			units: Unit[];
			users: User[];
			form: SuperValidated<Infer<UnitSchema>>;
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(unitSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.toast_success_unit_created());
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to create unit');
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);

	const pages = {
		title: 'Units',
		excerpt: 'Manage organizational units.'
	};

	let selectedUser = $derived({
		label: data.users.find((u) => u.id === $formData.userId)?.name ?? 'Select unit manager',
		value: $formData.userId
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
				You have {data?.units.length} unit(s)
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"><Plus /> Add Unit</Button>
		</div>
	</div>
	<Separator />
	<DataTable data={data?.units} columns={createColumns(data?.formDestroy, data.form, data.users)} />
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Add Unit</Dialog.Title>
			<Dialog.Description>Add a new organizational unit.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit Name</Form.Label>
						<Input {...props} bind:value={$formData.name} placeholder="Finance Unit" required />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="userId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Unit Manager</Form.Label>
						<Select.Root type="single" bind:value={$formData.userId} name={props.name}>
							<Select.Trigger {...props}>
								{selectedUser.label}
							</Select.Trigger>
							<Select.Content>
								{#each data.users as user (user.id)}
									<Select.Item value={String(user.id)} label={user.name ?? ''}>
										{user.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
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
