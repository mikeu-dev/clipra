<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	let { data } = $props();

	const leadSchema = z.object({
		name: z.string().min(1).max(255),
		contactName: z.string().optional(),
		email: z.string().email().optional().or(z.literal('')),
		phone: z.string().optional(),
		type: z.enum(['lead', 'opportunity']).default('lead'),
		stage: z.enum(['new', 'qualified', 'proposition', 'negotiation', 'won', 'lost']).default('new'),
		expectedRevenue: z.number().min(0).default(0),
		probability: z.number().min(0).max(100).default(0),
		priority: z.enum(['low', 'medium', 'high']).default('medium'),
		notes: z.string().optional()
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(leadSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_lead_created());
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	const stages = [
		{ value: 'new', label: 'New' },
		{ value: 'qualified', label: 'Qualified' },
		{ value: 'proposition', label: 'Proposition' },
		{ value: 'negotiation', label: 'Negotiation' },
		{ value: 'won', label: 'Won' },
		{ value: 'lost', label: 'Lost' }
	];
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Create Lead / Opportunity
		</h2>
		<p class="text-muted-foreground">Track a new sales prospect.</p>
	</div>
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
		<div class="flex-1 lg:max-w-2xl">
			<form method="POST" use:enhance class="space-y-8">
				<Form.Field {form} name="name">
					<Label>Opportunity Name</Label>
					<Form.Control>
						{#snippet children({ attrs })}
							<Input
								{...attrs}
								bind:value={$formData.name}
								placeholder="e.g. 50 Laptops for Tech Corp"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="contactName">
						<Label>Contact Name</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input {...attrs} bind:value={$formData.contactName} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="email">
						<Label>Email</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input {...attrs} type="email" bind:value={$formData.email} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Form.Field {form} name="stage">
					<Label>Stage</Label>
					<Form.Control>
						{#snippet children({ attrs })}
							<Select.Root bind:value={$formData.stage} type="single">
								<Select.Trigger {...attrs}>
									<div class="line-clamp-1 flex w-full items-center gap-2">
										{stages.find((t) => t.value === $formData.stage)?.label || 'Select Stage'}
									</div>
								</Select.Trigger>
								<Select.Content>
									{#each stages as stage (stage.value)}
										<Select.Item value={stage.value} label={stage.label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden name={attrs.name} bind:value={$formData.stage} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="expectedRevenue">
						<Label>Expected Revenue</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input
									type="number"
									step="0.01"
									{...attrs}
									bind:value={$formData.expectedRevenue}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="probability">
						<Label>Probability (%)</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input
									type="number"
									step="1"
									max="100"
									{...attrs}
									bind:value={$formData.probability}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Form.Field {form} name="notes">
					<Label>Notes</Label>
					<Form.Control>
						{#snippet children({ attrs })}
							<Textarea {...attrs} bind:value={$formData.notes} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Button type="submit">Create Lead</Button>
			</form>
		</div>
	</div>
</div>
