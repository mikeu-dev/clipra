<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	import * as Select from '$lib/components/ui/select';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { untrack } from 'svelte';

	let { data } = $props();

	// Replicate schema for client
	const journalEntrySchema = z.object({
		date: z.string(),
		reference: z.string().optional(),
		items: z
			.array(
				z.object({
					accountId: z.string().min(1, 'Account required'),
					description: z.string().min(1, 'Description required'),
					debit: z.number().min(0).default(0),
					credit: z.number().min(0).default(0)
				})
			)
			.min(2)
			.refine(
				(items) => {
					const debit = items.reduce((sum, i) => sum + i.debit, 0);
					const credit = items.reduce((sum, i) => sum + i.credit, 0);
					return Math.abs(debit - credit) < 0.01;
				},
				{ message: 'Debit and Credit must balance' }
			)
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(journalEntrySchema),
			dataType: 'json',
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_journal_entry_posted());
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance, errors } = form;

	function addItem() {
		$formData.items = [...$formData.items, { accountId: '', description: '', debit: 0, credit: 0 }];
	}

	function removeItem(index: number) {
		$formData.items = $formData.items.filter((_, i) => i !== index);
	}

	// Calculate totals for display
	let totalDebit = $derived($formData.items.reduce((sum, i) => sum + (i.debit || 0), 0));
	let totalCredit = $derived($formData.items.reduce((sum, i) => sum + (i.credit || 0), 0));
	let isBalanced = $derived(Math.abs(totalDebit - totalCredit) < 0.01);
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">New Journal Entry</h2>
		<p class="text-muted-foreground">Create a manual journal entry.</p>
	</div>

	<div class="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
		<div class="flex-1">
			<form method="POST" use:enhance class="space-y-8">
				<div class="grid max-w-xl grid-cols-2 gap-4">
					<Form.Field {form} name="date">
						<Form.Control>
							{#snippet children({ attrs })}
								<Form.Label>Date</Form.Label>
								<Input type="date" {...attrs} bind:value={$formData.date} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="reference">
						<Form.Control>
							{#snippet children({ attrs })}
								<Form.Label>Reference</Form.Label>
								<Input
									{...attrs}
									bind:value={$formData.reference}
									placeholder="e.g. Opening Balance"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<div class="rounded-md border p-4">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="font-semibold">Journal Items</h3>
						<Button type="button" variant="outline" size="sm" onclick={addItem}>
							<Plus class="mr-2 h-4 w-4" /> Add Item
						</Button>
					</div>

					<div class="space-y-2">
						<!-- Header -->
						<div
							class="text-muted-foreground mb-2 grid grid-cols-12 gap-2 px-2 text-sm font-medium"
						>
							<div class="col-span-4">Account</div>
							<div class="col-span-4">Label</div>
							<div class="col-span-2 text-right">Debit</div>
							<div class="col-span-2 text-right">Credit</div>
						</div>

						{#each $formData.items as item, index (index)}
							<div class="group grid grid-cols-12 items-start gap-2">
								<div class="col-span-4">
									<Select.Root bind:value={item.accountId} type="single">
										<Select.Trigger class="w-full">
											<div class="line-clamp-1 flex w-full items-center gap-2">
												{data.accounts.find((a) => a.id === item.accountId)?.name ||
													'Select Account'}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each data.accounts as account (account.id)}
												<Select.Item
													value={account.id}
													label={`${account.code} - ${account.name}`}
												/>
											{/each}
										</Select.Content>
									</Select.Root>
									{#if $errors.items?.[index]?.accountId}
										<p class="text-destructive mt-1 text-[0.8rem] font-medium">
											{$errors.items[index].accountId}
										</p>
									{/if}
								</div>

								<div class="col-span-4">
									<Input bind:value={item.description} placeholder="Description" />
									{#if $errors.items?.[index]?.description}
										<p class="text-destructive mt-1 text-[0.8rem] font-medium">
											{$errors.items[index].description}
										</p>
									{/if}
								</div>

								<div class="col-span-2">
									<Input
										type="number"
										class="text-right"
										step="0.01"
										bind:value={item.debit}
										oninput={() => {
											if (item.debit > 0) item.credit = 0;
										}}
									/>
								</div>

								<div class="col-span-2 flex gap-2">
									<Input
										type="number"
										class="text-right"
										step="0.01"
										bind:value={item.credit}
										oninput={() => {
											if (item.credit > 0) item.debit = 0;
										}}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="text-destructive h-10 w-10 opacity-0 transition-opacity group-hover:opacity-100"
										onclick={() => removeItem(index)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-4 border-t pt-4">
						<div class="grid grid-cols-12 gap-2 text-sm font-semibold">
							<div class="col-span-8 pr-4 text-right">Total</div>
							<div class="col-span-2 text-right">{totalDebit.toLocaleString()}</div>
							<div class="col-span-2 pr-12 text-right">{totalCredit.toLocaleString()}</div>
						</div>
						{#if !isBalanced}
							<p class="text-destructive mt-2 text-right text-sm">
								Debit and Credit must match (Diff: {Math.abs(
									totalDebit - totalCredit
								).toLocaleString()})
							</p>
						{/if}
						{#if $errors.items?._errors}
							{#each $errors.items._errors as error, i (i)}
								<p class="text-destructive mt-1 text-right text-sm">{error}</p>
							{/each}
						{/if}
					</div>
				</div>

				<div class="flex justify-end">
					<Button type="submit" disabled={!isBalanced || $formData.items.length < 2}
						>Post Journal Entry</Button
					>
				</div>
			</form>
		</div>
	</div>
</div>
