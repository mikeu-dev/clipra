<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { untrack } from 'svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';

	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { jobSchema } from '$lib/schemas/career';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import RichEditor from '$lib/components/rich-editor/rich-editor.svelte';

	let { data } = $props();

	const form = superForm(
		untrack(() => data.form),
		{
			validators: zodClient(jobSchema),
			onResult: ({ result }) => {
				if (result.type === 'failure' || result.type === 'error') {
					toast.error('Gagal mengupdate data.');
				} else if (result.type === 'redirect') {
					toast.success(m.toast_success_vacancy_updated());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;

	// Opsi Type
	const typeOptions = [
		{ value: 'Full-time', label: 'Full-time' },
		{ value: 'Part-time', label: 'Part-time' },
		{ value: 'Internship', label: 'Internship' },
		{ value: 'Contract', label: 'Contract' }
	];

	// Opsi Status
	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
		{ value: 'closed', label: 'Closed' }
	];
</script>

<svelte:head>
	<title>Edit Lowongan - ERP</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="bg-card text-card-foreground mx-auto w-full max-w-7xl rounded-lg border shadow-sm">
		<div class="flex flex-col space-y-1.5 p-6">
			<h3 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Edit Lowongan: {data.job.title}
			</h3>
			<p class="text-muted-foreground">Update informasi lowongan pekerjaan.</p>
		</div>
		<div class="p-6 pt-0">
			<form method="POST" use:enhance class="space-y-6">
				<input type="hidden" name="id" value={$formData.id} />

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Form.Field {form} name="title">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Judul Posisi</Form.Label>
								<Input {...props} bind:value={$formData.title} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="location">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Lokasi</Form.Label>
								<Input {...props} bind:value={$formData.location} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="type">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Tipe Pekerjaan</Form.Label>
								<Select.Root type="single" bind:value={$formData.type} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.type || 'Pilih Tipe'}
									</Select.Trigger>
									<Select.Content>
										{#each typeOptions as option (option.value)}
											<Select.Item value={option.value}>{option.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="status">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Status</Form.Label>
								<Select.Root type="single" bind:value={$formData.status} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.status
											? statusOptions.find((o) => o.value === $formData.status)?.label
											: 'Pilih Status'}
									</Select.Trigger>
									<Select.Content>
										{#each statusOptions as option (option.value)}
											<Select.Item value={option.value}>{option.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<!-- Slug (Optional) -->
				<Form.Field {form} name="slug">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Slug</Form.Label>
							<Input {...props} bind:value={$formData.slug} />
						{/snippet}
					</Form.Control>
					<Form.Description>Biarkan kosong untuk generate otomatis dari judul.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Deskripsi Pekerjaan</Form.Label>
							<div class="min-h-[200px] rounded-md border">
								<RichEditor
									bind:value={$formData.description}
									id="desc-editor"
									toolbarId="desc-toolbar"
								/>
							</div>
							<input type="hidden" name={props.name} bind:value={$formData.description} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="requirements">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Persyaratan (Opsional)</Form.Label>
							<div class="min-h-[200px] rounded-md border">
								<RichEditor
									bind:value={$formData.requirements}
									id="req-editor"
									toolbarId="req-toolbar"
								/>
							</div>
							<input type="hidden" name={props.name} bind:value={$formData.requirements} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="flex justify-end gap-4 pt-4">
					<Button variant="outline" href="/panel/career" type="button">{m.btn_cancel()}</Button>
					<Button type="submit" disabled={$delayed}>
						{#if $delayed}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							Menyimpan...
						{:else}
							{m.btn_save_vacancy()}
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>
