<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { categorySchema } from '$lib/schemas/category';
	import { idSchema } from '$lib/schemas/destroy';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';
	import type { PageData } from './$types';
	import type { Category } from '$lib/server/database/schemas';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';

	let { data } = $props<{ data: PageData }>();

	let isCreateOpen = $state(false);
	let isDeleteOpen = $state(false);
	let editingCategory = $state<Category | null>(null);

	const form = superForm(
		untrack(() => data.form),
		{
			id: 'create-category-form',
			validators: zodClient(categorySchema),
			onUpdated: ({ form }) => {
				if (form.valid) {
					const isEditing = !!editingCategory;
					isCreateOpen = false;
					editingCategory = null;
					toast.success(isEditing ? 'Kategori diperbarui nyaa~' : 'Kategori dibuat nyaa~');
				} else {
					toast.error('Gagal memproses kategori. Periksa input anda nyaa~');
				}
			},
			onError: ({ result }) => {
				toast.error('Terjadi kesalahan sistem nyaa~');
				console.error('Superform Error:', result);
			}
		}
	);

	const { form: formData, enhance, delayed } = form;

	const formDestroy = superForm(
		untrack(() => data.formDestroy),
		{
			id: 'delete-category-form',
			validators: zodClient(idSchema),
			onUpdated: ({ form }) => {
				if (form.valid) {
					isDeleteOpen = false;
					toast.success('Kategori dihapus nyaa~');
				} else {
					toast.error('Gagal menghapus kategori nyaa~');
				}
			},
			onError: ({ result }) => {
				toast.error('Terjadi kesalahan saat menghapus nyaa~');
				console.error('Superform Delete Error:', result);
			}
		}
	);

	const { form: formDataDestroy, enhance: enhanceDestroy } = formDestroy;

	function openEdit(category: Category) {
		editingCategory = category;
		$formData.id = category.id;
		$formData.name = category.name;
		$formData.description = category.description || '';
		$formData.parentId = category.parentId || '';
		$formData.type = category.type;
		isCreateOpen = true;
	}

	function openDelete(id: string) {
		$formDataDestroy.id = id;
		isDeleteOpen = true;
	}

	import { setContext } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	setContext('category-actions', { openEdit, openDelete });

	export interface CategoryWithDepth extends Category {
		depth: number;
		isOrphan?: boolean;
	}

	function flattenCategories(cats: Category[]): CategoryWithDepth[] {
		const result: CategoryWithDepth[] = [];
		const addedIds = new SvelteSet<string>();

		function buildTree(parentId: string | null, depth: number) {
			const normalizedParentId = parentId === '' ? null : parentId;
			const children = cats.filter((c) => (c.parentId || null) === (normalizedParentId || null));
			for (const child of children) {
				if (addedIds.has(child.id)) continue;
				addedIds.add(child.id);
				result.push({ ...child, depth });
				buildTree(child.id, depth + 1);
			}
		}

		// Build start from Root (parentId is null or empty)
		buildTree(null, 0);

		// Add orphans (categories whose parent doesn't exist or is invalid)
		for (const cat of cats) {
			if (!addedIds.has(cat.id)) {
				addedIds.add(cat.id);
				result.push({ ...cat, depth: 0, isOrphan: true });
				buildTree(cat.id, 1);
			}
		}

		return result;
	}

	const displayCategories = $derived(flattenCategories(data.categories || []));

	$effect(() => {
		if (data.categories.length > 0) {
			console.log('--- CATEGORIES DEBUG ---');
			console.log('Total in DB:', data.categories.length);
			console.log('Total displayed:', displayCategories.length);
			if (data.categories.length !== displayCategories.length) {
				console.error('Mismatch detected! Some categories are still hidden.');
			}
		}
	});

	const types = [
		{ value: 'product', label: 'Produk (Inventory)' },
		{ value: 'expense', label: 'Beban (Finance)' },
		{ value: 'asset', label: 'Aset' },
		{ value: 'other', label: 'Lainnya' }
	];

	let selectedTypeLabel = $derived(
		types.find((t) => t.value === $formData.type)?.label ?? 'Pilih Tipe'
	);
	let selectedParentLabel = $derived(
		!$formData.parentId || $formData.parentId === ''
			? 'Tanpa Induk'
			: (data.categories.find((c: Category) => c.id === $formData.parentId)?.name ?? 'Tanpa Induk')
	);
	const pages = {
		title: 'Categories',
		excerpt: 'Manage organizational categories for various modules.'
	};
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
				You have {data?.categories.length} category(s)
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button
				onclick={() => {
					editingCategory = null;
					form.reset();
					isCreateOpen = true;
				}}
				size="sm"
				variant="outline"
			>
				<Plus /> Add Category
			</Button>
		</div>
	</div>
	<Separator />
	<DataTable {columns} data={displayCategories} />
</div>

<!-- Modal Create/Edit -->
<Dialog.Root bind:open={isCreateOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</Dialog.Title>
			<Dialog.Description>
				Isi detail kategori di bawah ini. Pastikan tipe kategori sesuai dengan modulnya nyaa~
			</Dialog.Description>
		</Dialog.Header>
		<form
			id="create-category-form"
			method="POST"
			action={editingCategory ? '?/update' : '?/create'}
			use:enhance
			class="space-y-4"
		>
			<input type="hidden" name="id" bind:value={$formData.id} />

			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nama Kategori</Form.Label>
						<Input
							{...props}
							bind:value={$formData.name}
							placeholder="Misal: Elektronik, Biaya Kantor..."
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="type">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Tipe Modul</Form.Label>
						<Select.Root
							type="single"
							bind:value={$formData.type as typeof $formData.type}
							name={props.name}
						>
							<Select.Trigger {...props}>
								{selectedTypeLabel}
							</Select.Trigger>
							<Select.Content>
								{#each types as t (t.value)}
									<Select.Item value={t.value} label={t.label}>{t.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="parentId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Kategori Induk (Opsional)</Form.Label>
						<Select.Root type="single" bind:value={$formData.parentId as string} name={props.name}>
							<Select.Trigger {...props}>
								{selectedParentLabel}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="Tanpa Induk">Tanpa Induk</Select.Item>
								{#each data.categories.filter((c: Category) => c.id !== $formData.id) as cat (cat.id)}
									<Select.Item value={cat.id} label={cat.name}>{cat.name} ({cat.type})</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Deskripsi</Form.Label>
						<Input
							{...props}
							bind:value={$formData.description}
							placeholder="Keterangan singkat..."
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex justify-end gap-2 pt-4">
				<Button variant="outline" onclick={() => (isCreateOpen = false)} disabled={$delayed}
					>Batal</Button
				>
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					{editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal Delete -->
<Dialog.Root bind:open={isDeleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus Kategori?</Dialog.Title>
			<Dialog.Description>
				Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen nyaa~
			</Dialog.Description>
		</Dialog.Header>
		<form
			id="delete-category-form"
			method="POST"
			action="?/destroy"
			use:enhanceDestroy
			class="flex justify-end gap-2 pt-4"
		>
			<input type="hidden" name="id" bind:value={$formDataDestroy.id} />
			<Button variant="outline" onclick={() => (isDeleteOpen = false)}>Batal</Button>
			<Button type="submit" variant="destructive">Hapus Sekarang</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
