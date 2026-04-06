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
	import { untrack } from 'svelte';

	let { data } = $props();

	const moveSchema = z.object({
		productId: z.string().min(1),
		locationId: z.string().min(1),
		locationDestId: z.string().min(1),
		quantity: z.number().min(0.01),
		reference: z.string().optional()
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(moveSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_stock_move_processed());
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
			New Stock Move
		</h2>
		<p class="text-muted-foreground">Manually move stock between locations.</p>
	</div>
	<div class="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
		<div class="flex-1 lg:max-w-2xl">
			<form method="POST" use:enhance class="space-y-8">
				<Form.Field {form} name="reference">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Reference</Form.Label>
							<Input {...attrs} bind:value={$formData.reference} placeholder="Optional reference" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="productId">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Product</Form.Label>
							<Select.Root bind:value={$formData.productId} type="single" name={attrs.name}>
								<Select.Trigger {...attrs}>
									<div class="line-clamp-1 flex w-full items-center gap-2">
										{data.products.find((c) => c.id === $formData.productId)?.name ||
											'Select a product'}
									</div>
								</Select.Trigger>
								<Select.Content>
									{#each data.products as product (product.id)}
										<Select.Item value={product.id} label={product.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="locationId">
						<Form.Control>
							{#snippet children({ attrs })}
								<Form.Label>From (Source)</Form.Label>
								<Select.Root bind:value={$formData.locationId} type="single" name={attrs.name}>
									<Select.Trigger {...attrs}>
										<div class="line-clamp-1 flex w-full items-center gap-2">
											{data.locations.find((c) => c.id === $formData.locationId)?.name ||
												'Select Location'}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each data.locations as location (location.id)}
											<Select.Item value={location.id} label={location.name} />
										{/each}
									</Select.Content>
								</Select.Root>
								<input hidden name={attrs.name} bind:value={$formData.locationId} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="locationDestId">
						<Form.Control>
							{#snippet children({ attrs })}
								<Form.Label>To (Destination)</Form.Label>
								<Select.Root bind:value={$formData.locationDestId} type="single" name={attrs.name}>
									<Select.Trigger {...attrs}>
										<div class="line-clamp-1 flex w-full items-center gap-2">
											{data.locations.find((c) => c.id === $formData.locationDestId)?.name ||
												'Select Location'}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each data.locations as location (location.id)}
											<Select.Item value={location.id} label={location.name} />
										{/each}
									</Select.Content>
								</Select.Root>
								<input hidden name={attrs.name} bind:value={$formData.locationDestId} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Form.Field {form} name="quantity">
					<Form.Control>
						{#snippet children({ attrs })}
							<Form.Label>Quantity</Form.Label>
							<Input type="number" step="0.01" {...attrs} bind:value={$formData.quantity} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Button type="submit">Process Move</Button>
			</form>
		</div>
	</div>
</div>
