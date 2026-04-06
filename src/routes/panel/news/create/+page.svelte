<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import { untrack } from 'svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from '$lib/schemas/news/form';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import RichEditor from '$lib/components/rich-editor/rich-editor.svelte';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	let { data } = $props<{ data: PageData }>();

	const form = superForm(
		untrack(() => data.form as SuperValidated<Infer<FormSchema>>),
		{
			validators: zodClient(formSchema),
			onResult: ({ result }) => {
				if (result.type === 'failure' || result.type === 'error') {
					toast.error('Gagal membuat berita.');
				} else if (result.type === 'redirect') {
					toast.success(m.toast_success_news_created());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let thumbnailFiles = $state([]);
	function slugify(text: string) {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-') // Replace spaces with -
			.replace(/[^\w-]+/g, '') // Remove all non-word chars
			.replace(/--+/g, '-'); // Replace multiple - with single -
	}

	function handleTitleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		$formData.slug = slugify(target.value);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleProcessFile = (error: any, file: any) => {
		if (!error) {
			$formData.thumbnail = file.serverId;
		}
	};
</script>

<header
	class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex items-center gap-2 px-4">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="/panel">Panel</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/panel/news">News</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>Create</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Create News
			</h2>
			<p class="text-muted-foreground">Create a new article.</p>
		</div>
	</div>
	<Separator />

	<div class="max-w-7xl">
		<form method="POST" use:enhance class="space-y-6">
			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Title</Form.Label>
							<Input
								{...props}
								bind:value={$formData.title}
								oninput={handleTitleInput}
								placeholder="Enter title"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description />
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="slug">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Slug (Auto-generated)</Form.Label>
							<Input {...props} bind:value={$formData.slug} readonly placeholder="Auto-generated" />
						{/snippet}
					</Form.Control>
					<Form.Description>URL friendly name.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="type">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Category/Type</Form.Label>
							<Input {...props} bind:value={$formData.type} placeholder="Technology, Event, etc." />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="tags">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Tags</Form.Label>
							<Input
								{...props}
								bind:value={$formData.tags}
								placeholder="Separate with comma (e.g. Tech, AI)"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<Form.Field {form} name="thumbnail">
				<Form.Control>
					<Form.Label>Thumbnail</Form.Label>
					<FilePond
						files={thumbnailFiles}
						server={{
							process: '/api/file/upload',
							revert: null
						}}
						allowMultiple={false}
						acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
						onprocessfile={handleProcessFile}
					/>
					<input type="hidden" name="thumbnail" bind:value={$formData.thumbnail} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="content">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Content</Form.Label>
						<RichEditor {...props} bind:value={$formData.content} />
						<input type="hidden" name={props.name} bind:value={$formData.content} />
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>

			{#if data.permissions?.includes('news.publish')}
				<Form.Field {form} name="published">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center space-x-2">
								<Switch {...props} bind:checked={$formData.published} />
								<Form.Label>Published</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
					<Form.Description>Allow this article to be seen by the public.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			{/if}

			<div class="flex justify-end gap-2">
				<Button variant="outline" href="/panel/news">Cancel</Button>
				<Button type="submit" disabled={$delayed}>
					{#if $delayed}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Save
				</Button>
			</div>
		</form>
	</div>
</div>
