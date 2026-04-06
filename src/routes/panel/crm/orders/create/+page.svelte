<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	let { data } = $props();

	const orderSchema = z.object({
		clientId: z.string().min(1),
		productId: z.string().min(1),
		quantity: z.number().min(1).default(1),
		price: z.number().min(0).default(0),
		notes: z.string().optional()
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(orderSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_quotation_created());
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Create Quotation
		</h2>
		<p class="text-muted-foreground">Create a new sales quotation for a customer.</p>
	</div>
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
		<div class="flex-1 lg:max-w-2xl">
			<form method="POST" use:enhance class="space-y-8">
				<Form.Field {form} name="clientId">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Customer (Lead)</Form.Label>
							<Select.Root bind:value={$formData.clientId} type="single">
								<Select.Trigger {...attrs}>
									<div class="line-clamp-1 flex w-full items-center gap-2">
										{data.clients.find((c) => c.id === $formData.clientId)?.name ||
											'Select Customer'}
									</div>
								</Select.Trigger>
								<Select.Content>
									{#each data.clients as client (client.id)}
										<Select.Item value={client.id} label={client.name} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden name={attrs.name} bind:value={$formData.clientId} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="space-y-4 rounded-md border p-4">
					<h3 class="font-semibold">Line Item (Quick Add)</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Form.Field {form} name="productId">
							<Form.Control>
								{#snippet children({ attrs })}
									<Form.Label>Product</Form.Label>
									<Select.Root
										bind:value={$formData.productId}
										type="single"
										onValueChange={(v) => {
											// Auto-fill price if possible? For now manual.
											const p = data.products.find((c) => c.id === v);
											if (p && p.salesPrice) {
												$formData.price = Number(p.salesPrice);
											}
										}}
									>
										<Select.Trigger {...attrs}>
											<div class="line-clamp-1 flex w-full items-center gap-2">
												{data.products.find((c) => c.id === $formData.productId)?.name ||
													'Select Product'}
											</div>
										</Select.Trigger>
										<Select.Content>
											{#each data.products as product (product.id)}
												<Select.Item value={product.id} label={product.name} />
											{/each}
										</Select.Content>
									</Select.Root>
									<input hidden name={attrs.name} bind:value={$formData.productId} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>

						<div class="grid grid-cols-2 gap-2">
							<Form.Field {form} name="quantity">
								<Form.Control>
									{#snippet children({ attrs })}
										<Form.Label>Quantity</Form.Label>
										<Input type="number" step="1" {...attrs} bind:value={$formData.quantity} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>

							<Form.Field {form} name="price">
								<Form.Control>
									{#snippet children({ attrs })}
										<Form.Label>Unit Price</Form.Label>
										<Input type="number" step="0.01" {...attrs} bind:value={$formData.price} />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</div>
				</div>

				<Form.Field {form} name="notes">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Notes</Form.Label>
							<Textarea {...attrs} bind:value={$formData.notes} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Button type="submit">Create Quotation</Button>
			</form>
		</div>
	</div>
</div>
