<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	let { data } = $props();

	// Re-define schema for client-side validation hint,
	// though superForm handles it with the validator passed from server usually.
	// Using explicit schema here for types if needed.
	const accountSchema = z.object({
		code: z.string().min(1).max(20),
		name: z.string().min(1).max(255),
		type: z.enum([
			'receivable',
			'payable',
			'liquidity',
			'current_assets',
			'bank',
			'cash',
			'assets',
			'liability',
			'equity',
			'income',
			'expense',
			'cost_of_revenue',
			'other_income',
			'other_expense'
		]),
		reconcile: z.boolean().default(false),
		description: z.string().optional()
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(accountSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_account_created());
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	const accountTypes = [
		{ value: 'receivable', label: 'Receivable' },
		{ value: 'payable', label: 'Payable' },
		{ value: 'liquidity', label: 'Liquidity (Bank/Cash)' },
		{ value: 'current_assets', label: 'Current Assets' },
		{ value: 'bank', label: 'Bank' },
		{ value: 'cash', label: 'Cash' },
		{ value: 'assets', label: 'Non-current Assets' },
		{ value: 'liability', label: 'Liability' },
		{ value: 'equity', label: 'Equity' },
		{ value: 'income', label: 'Income' },
		{ value: 'expense', label: 'Expense' },
		{ value: 'cost_of_revenue', label: 'Cost of Revenue' },
		{ value: 'other_income', label: 'Other Income' },
		{ value: 'other_expense', label: 'Other Expense' }
	];
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Create Account
		</h2>
		<p class="text-muted-foreground">Add a new account to your Chart of Accounts.</p>
	</div>
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
		<div class="flex-1 lg:max-w-2xl">
			<form method="POST" use:enhance class="space-y-8">
				<Form.Field {form} name="code">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Code</Form.Label>
							<Input {...attrs} bind:value={$formData.code} placeholder="e.g. 10100" />
						{/snippet}
					</Form.Control>
					<Form.Description>Unique code for the account.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Name</Form.Label>
							<Input {...attrs} bind:value={$formData.name} placeholder="e.g. Bank BCA" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="type">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Type</Form.Label>
							<Select.Root bind:value={$formData.type} type="single">
								<Select.Trigger {...attrs}>
									<div class="line-clamp-1 flex w-full items-center gap-2">
										{accountTypes.find((t) => t.value === $formData.type)?.label ||
											'Select an account type'}
									</div>
								</Select.Trigger>
								<Select.Content>
									{#each accountTypes as type (type.value)}
										<Select.Item value={type.value} label={type.label} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden name={attrs.name} bind:value={$formData.type} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="reconcile">
					<Form.Control>
						{#snippet children({ attrs })}
							<div class="flex items-center space-x-2">
								<Checkbox {...attrs} bind:checked={$formData.reconcile} />
								<Form.Label>Allow Reconciliation</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
					<Form.Description
						>Check this if this account allows matching entries (e.g. Receivables).</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Description</Form.Label>
							<Textarea {...attrs} bind:value={$formData.description} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Button type="submit">Create Account</Button>
			</form>
		</div>
	</div>
</div>
