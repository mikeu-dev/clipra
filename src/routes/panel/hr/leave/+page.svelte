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
	import { Textarea } from '$lib/components/ui/textarea';
	import { leaveRequestSchema, type LeaveRequestSchema } from '$lib/schemas/leave-request';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { LeaveRequest } from '$lib/types';

	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';

	let {
		data
	}: {
		data: {
			requests: LeaveRequest[];
			form: SuperValidated<Infer<LeaveRequestSchema>>;
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(leaveRequestSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Leave request submitted successfully');
					isOpen = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to submit leave request');
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isOpen = $state(false);

	const pages = {
		title: 'Leave Requests',
		excerpt: 'Manage employee leave requests.'
	};

	let selectedType = $derived({
		label: $formData.type
			? $formData.type.charAt(0).toUpperCase() + $formData.type.slice(1)
			: 'Select type',
		value: $formData.type
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
				You have {data?.requests.length} request(s)
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={() => (isOpen = true)} size="sm" variant="outline"
				><Plus /> New Request</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable data={data?.requests} columns={createColumns(data?.formDestroy)} />
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">New Leave Request</Dialog.Title>
			<Dialog.Description>Submit a new leave request for approval.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:enhance>
			<Form.Field {form} name="type">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Type</Form.Label>
						<Select.Root type="single" bind:value={$formData.type} name={props.name}>
							<Select.Trigger {...props}>
								{selectedType.label}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="annual" label="Annual">Annual</Select.Item>
								<Select.Item value="sick" label="Sick">Sick</Select.Item>
								<Select.Item value="unpaid" label="Unpaid">Unpaid</Select.Item>
								<Select.Item value="other" label="Other">Other</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="startDate">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Start Date</Form.Label>
							<Input {...props} type="date" bind:value={$formData.startDate} required />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="endDate">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>End Date</Form.Label>
							<Input {...props} type="date" bind:value={$formData.endDate} required />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field {form} name="reason">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Reason</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.reason}
							placeholder="Please provide a reason..."
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
						Please wait
					</Form.Button>
				{:else}
					<Form.Button class="flex w-full justify-center">Submit</Form.Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
