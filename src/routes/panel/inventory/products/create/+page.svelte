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
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	let { data } = $props();

	const productSchema = z.object({
		name: z.string().min(1).max(255),
		code: z.string().max(100).optional(),
		brand: z.string().max(100).optional(),
		unit: z.string().max(50).optional(),
		image: z.string().url('Invalid image URL').optional().or(z.literal('')),
		categoryId: z.string().optional(),
		type: z.enum(['goods', 'service', 'consumable']).default('goods'),
		salesPrice: z.number().min(0).default(0),
		cost: z.number().min(0).default(0),
		description: z.string().optional()
	});

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(productSchema),
			onUpdated: ({ form: f }) => {
				if (f.valid) {
					toast.success(m.toast_success_product_created());
				} else {
					toast.error(m.toast_error_fix_form());
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	let imageFiles = $state([]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleProcessFile = (error: any, file: any) => {
		if (!error) {
			$formData.image = file.serverId;
		}
	};

	const productTypes = [
		{ value: 'goods', label: 'Storable Product' },
		{ value: 'service', label: 'Service' },
		{ value: 'consumable', label: 'Consumable' }
	];
</script>

<div class="space-y-6 p-10 pb-16 md:block">
	<div class="space-y-0.5">
		<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
			Create Product
		</h2>
		<p class="text-muted-foreground">Add a new product to your inventory.</p>
	</div>
	<div class="flex flex-col space-y-8">
		<div class="w-full">
			<form method="POST" use:enhance class="space-y-8">
				<Form.Field {form} name="name">
					<Label>Product Name</Label>
					<Form.Control>
						{#snippet children({ attrs })}
							<Input {...attrs} bind:value={$formData.name} placeholder="e.g. Office Desk" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="code">
						<Label>Internal Reference (SKU)</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input {...attrs} bind:value={$formData.code} placeholder="e.g. FURN-001" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="categoryId">
						<Label>Category</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Select.Root bind:value={$formData.categoryId} type="single" name={attrs.name}>
									<Select.Trigger {...attrs} class="w-full">
										<div class="line-clamp-1 flex w-full items-center gap-2">
											{data.categories.find((c) => c.id === $formData.categoryId)?.name ||
												'Select Category'}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each data.categories as category (category.id)}
											<Select.Item value={category.id} label={category.name} />
										{/each}
									</Select.Content>
								</Select.Root>
								<input hidden name={attrs.name} bind:value={$formData.categoryId} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="brand">
						<Label>Brand / Merk</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input {...attrs} bind:value={$formData.brand} placeholder="e.g. IKEA" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="unit">
						<Label>Unit of Measure (Satuan)</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input {...attrs} bind:value={$formData.unit} placeholder="e.g. Pcs, Box, Kg" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Form.Field {form} name="image">
					<Form.Control>
						<Label>Product Image</Label>
						<FilePond
							files={imageFiles}
							server={{
								process: '/api/file/upload',
								revert: null
							}}
							allowMultiple={false}
							acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
							onprocessfile={handleProcessFile}
						/>
						<input type="hidden" name="image" bind:value={$formData.image} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<Form.Field {form} name="type">
						<Label>Product Type</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Select.Root bind:value={$formData.type} type="single" name={attrs.name}>
									<Select.Trigger {...attrs} class="w-full">
										<div class="line-clamp-1 flex w-full items-center gap-2">
											{productTypes.find((t) => t.value === $formData.type)?.label || 'Select Type'}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each productTypes as type (type.value)}
											<Select.Item value={type.value} label={type.label} />
										{/each}
									</Select.Content>
								</Select.Root>
								<input hidden name={attrs.name} bind:value={$formData.type} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="salesPrice">
						<Label>Sales Price</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input type="number" step="0.01" {...attrs} bind:value={$formData.salesPrice} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="cost">
						<Label>Cost</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Input type="number" step="0.01" {...attrs} bind:value={$formData.cost} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="description">
						<Label>Description</Label>
						<Form.Control>
							{#snippet children({ attrs })}
								<Textarea {...attrs} bind:value={$formData.description} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<Button type="submit">Create Product</Button>
			</form>
		</div>
	</div>
</div>
