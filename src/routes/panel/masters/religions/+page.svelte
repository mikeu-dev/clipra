<script lang="ts">
	import { untrack } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { religionSchema, type ReligionSchema } from '$lib/schemas/religion';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { IdSchema } from '$lib/schemas/destroy';
	import * as m from '$lib/paraglide/messages.js';

	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';

	let {
		data
	}: {
		data: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			religions: any[]; // Use specific type if available
			form: SuperValidated<Infer<ReligionSchema>>;
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(religionSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success(m.msg_role_created());
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.msg_role_failed());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);
</script>

<svelte:head>
	<title>{m.masters_religions_title()}</title>
	<meta name="description" content={m.masters_religions_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.masters_religions_title()}
			</h2>
			<p class="text-muted-foreground">
				{m.masters_roles_count({ count: data?.religions.length })}
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"
				><Plus /> {m.btn_add_religion()}</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable data={data?.religions} columns={createColumns(data?.formDestroy, data.form)} />
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">{m.dialog_add_religion()}</Dialog.Title>
			<Dialog.Description>{m.dialog_add_religion_desc()}</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.label_name()}</Form.Label>
						<Input
							{...props}
							bind:value={$formData.name}
							placeholder="Islam, Kristen, etc"
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="mt-4">
				{#if $delayed}
					<Form.Button disabled class="flex w-full justify-center">
						<LoaderCircle class="animate-spin" />
						{m.btn_please_wait()}
					</Form.Button>
				{:else}
					<Form.Button class="flex w-full justify-center">{m.btn_save()}</Form.Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
