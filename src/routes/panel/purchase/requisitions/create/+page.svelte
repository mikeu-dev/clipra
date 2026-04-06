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
	import { localizeHref } from '$lib/paraglide/runtime';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { data } = $props();

	const requisitionSchema = z.object({
		date: z.string().min(1, 'Date is required'),
		projectId: z.string().optional(),
		description: z.string().min(1, 'Description is required'),
		notes: z.string().optional(),
		items: z
			.array(
				z.object({
					productId: z.string().min(1, 'Product is required'),
					quantity: z.number().min(0.01),
					estimatedPrice: z.number().min(0),
					description: z.string().optional()
				})
			)
			.min(1, 'At least one item is required')
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(requisitionSchema),
			dataType: 'json',
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success('Purchase requisition created successfully');
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	// Initial data setup
	if (!$formData.items || $formData.items.length === 0) {
		$formData.items = [{ productId: '', quantity: 1, estimatedPrice: 0, description: '' }];
	}
	if (!$formData.date) {
		$formData.date = new Date().toISOString().split('T')[0];
	}

	function addItem() {
		$formData.items = [
			...$formData.items,
			{ productId: '', quantity: 1, estimatedPrice: 0, description: '' }
		];
	}

	function removeItem(index: number) {
		if ($formData.items.length > 1) {
			$formData.items = $formData.items.filter((_, i) => i !== index);
		}
	}
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Create Requisition
		</h2>
		<p class="text-muted-foreground">Request items for internal purchase approval.</p>
	</div>

	<form method="POST" use:enhance class="space-y-8">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<Form.Field {form} name="description">
					<Label>Purpose / Header Description</Label>
					<Form.Control>
						{#snippet children({ attrs })}
							<Input
								{...attrs}
								bind:value={$formData.description}
								placeholder="e.g. Office Supplies for Q2"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="date">
						<Label>Date</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input type="date" {...attrs} bind:value={$formData.date} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="projectId">
						<Label>Project (Optional)</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Select.Root bind:value={$formData.projectId} type="single" name={attrs.name}>
									<Select.Trigger {...attrs}>
										<div class="line-clamp-1 flex w-full items-center gap-2">
											{data.projects.find((p) => p.id === $formData.projectId)?.name ||
												'Select Project'}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each data.projects as project (project.id)}
											<Select.Item value={project.id} label={project.name} />
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>

			<Form.Field {form} name="notes">
				<Label>Justification / Notes</Label>
				<Form.Control>
					{#snippet children({ attrs })}
						<Textarea
							{...attrs}
							bind:value={$formData.notes}
							placeholder="Additional details or justification..."
							rows={5}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-medium">Requested Items</h3>
				<Button type="button" variant="outline" size="sm" onclick={addItem}>
					<Plus class="mr-2 h-4 w-4" /> Add Item
				</Button>
			</div>

			<div class="rounded-md border">
				<table class="w-full text-left text-sm">
					<thead class="bg-muted/50 border-b font-medium">
						<tr>
							<th class="p-3">Product</th>
							<th class="p-3">Description</th>
							<th class="w-10 p-3 text-center">Unit</th>
							<th class="w-24 p-3 text-center">Qty</th>
							<th class="w-32 p-3">Est. Price</th>
							<th class="w-32 p-3 text-right">Subtotal</th>
							<th class="w-10 p-3"></th>
						</tr>
					</thead>
					<tbody>
						{#each $formData.items as item, i (i)}
							{@const selectedProduct = data.products.find((p) => p.id === item.productId)}
							<tr class="border-b last:border-0">
								<td class="p-2">
									<Select.Root
										bind:value={item.productId}
										type="single"
										onValueChange={(v) => {
											const p = data.products.find((c) => c.id === v);
											if (p && p.cost) {
												item.estimatedPrice = Number(p.cost);
												if (!item.description) item.description = p.name;
											}
										}}
									>
										<Select.Trigger class="h-9">
											<div class="line-clamp-1 flex items-center gap-2">
												{#if selectedProduct}
													{#if selectedProduct.image}
														<img
															src={selectedProduct.image}
															alt={selectedProduct.name}
															class="h-6 w-6 rounded-sm object-cover"
														/>
													{/if}
													<span class="text-muted-foreground font-mono text-xs">
														[{selectedProduct.code || 'NO-SKU'}]
													</span>
													{selectedProduct.name}
												{:else}
													Product
												{/if}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each data.products as product (product.id)}
												<Select.Item value={product.id} label={product.name}>
													<div class="flex items-center gap-3">
														{#if product.image}
															<img
																src={product.image}
																alt={product.name}
																class="h-8 w-8 rounded-sm object-cover"
															/>
														{:else}
															<div
																class="bg-muted flex h-8 w-8 items-center justify-center rounded-sm"
															>
																<span class="text-[10px]">FIX</span>
															</div>
														{/if}
														<div class="flex flex-col">
															<span class="font-medium">{product.name}</span>
															{#if product.code}
																<span class="text-muted-foreground font-mono text-[10px]"
																	>{product.code}</span
																>
															{/if}
														</div>
													</div>
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</td>
								<td class="p-2">
									<Input bind:value={item.description} class="h-9" placeholder="Notes for item" />
								</td>
								<td class="p-2 text-center text-xs font-medium">
									{selectedProduct?.unit || '-'}
								</td>
								<td class="p-2">
									<Input type="number" bind:value={item.quantity} class="h-9 text-center" />
								</td>
								<td class="p-2">
									<Input type="number" bind:value={item.estimatedPrice} class="h-9" />
								</td>
								<td class="p-2 text-right font-medium">
									{(item.quantity * item.estimatedPrice).toLocaleString()}
								</td>
								<td class="p-2">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onclick={() => removeItem(i)}
										disabled={$formData.items.length === 1}
									>
										<Trash2 class="text-destructive h-4 w-4" />
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr class="bg-muted/30 font-bold">
							<td colspan="4" class="p-3 text-right">Total Estimate</td>
							<td class="p-3 text-right text-lg">
								{$formData.items
									.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0)
									.toLocaleString()}
							</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>

		<div class="flex justify-end gap-4">
			<Button variant="outline" href={localizeHref('/panel/purchase/requisitions')}>Cancel</Button>
			<Button type="submit">Submit Requisition</Button>
		</div>
	</form>
</div>
