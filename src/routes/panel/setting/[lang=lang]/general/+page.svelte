<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { type SuperValidated, superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { settingSchemaByLang, type SingleLangSetting } from '$lib/schemas/setting/setting';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import type { FilePondErrorDescription, FilePondFile } from 'filepond';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	type FilePondInitialFile = {
		source: string;
		options: {
			type: 'local';
		};
	};

	let logoLightFile: (File | FilePondInitialFile)[] = $state([]);
	let logoDarkFile: (File | FilePondInitialFile)[] = $state([]);
	let iconFile: (File | FilePondInitialFile)[] = $state([]);
	const lang = getLocale();

	// Data dari server, sudah di-filter sesuai locale
	let {
		data
	}: {
		data: {
			form: SuperValidated<SingleLangSetting>;
			urls: { logoDark: string; logoLight: string; icon: string };
		};
	} = $props();

	// Gunakan schema sesuai lang
	const form = superForm<SingleLangSetting>(
		untrack(() => data.form as SuperValidated<SingleLangSetting>),
		{
			validators: zodClient(settingSchemaByLang[lang]),
			onResult: async ({ result }) => {
				// Superforms automatically updates the form on success,
				// so we only need to display the toast message.
				if (result.type === 'success' && result.data?.message) {
					toast.success(result.data.message);
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.msg_save_error());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	$effect(() => {
		if (data.urls.logoLight) {
			logoLightFile = [{ source: data.urls.logoLight, options: { type: 'local' } }];
		}
		if (data.urls.logoDark) {
			logoDarkFile = [{ source: data.urls.logoDark, options: { type: 'local' } }];
		}
		if (data.urls.icon) {
			iconFile = [{ source: data.urls.icon, options: { type: 'local' } }];
		}
	});
</script>

<svelte:head>
	<title>{m.settings_general_title()}</title>
	<meta name="description" content={m.settings_general_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.settings_general_title()}
			</h2>
			<p class="text-muted-foreground">{m.settings_general_desc()}</p>
		</div>
	</div>

	<Separator />
	<div class="flex flex-1">
		<div class="border-border bg-background flex-1 rounded-lg border p-4">
			<form method="post" use:enhance>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Field {form} name="app_name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_app_name()}</Form.Label>
								<Input
									{...props}
									bind:value={$formData.app_name}
									placeholder={m.placeholder_app_name()}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="address">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_address()}</Form.Label>
								<Textarea
									{...props}
									bind:value={$formData.address}
									placeholder={m.placeholder_address()}
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="phone">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_phone()}</Form.Label>
								<Input {...props} bind:value={$formData.phone} placeholder="08xxxxxxxxxx" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_email()}</Form.Label>
								<Input
									{...props}
									bind:value={$formData.email}
									type="email"
									placeholder="contoh@email.com"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="website">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_website()}</Form.Label>
								<Input
									{...props}
									bind:value={$formData.website}
									placeholder="https://example.com"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="copyright">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>{m.label_copyright()}</Form.Label>
								<Input {...props} bind:value={$formData.copyright} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<div class="col-span-2">
						<Form.Field {form} name="about">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>{m.label_about_app()}</Form.Label>
									<Textarea {...props} bind:value={$formData.about} rows={4} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<Form.Field {form} name="logo_light">
						<Form.Control>
							<!-- snippet replaced with direct children as props are unused -->
							<Form.Label>{m.label_logo_light()}</Form.Label>
							<!-- server: api ke /tmp (routes/api/v1/file/<upload or revert>) -->
							<FilePond
								files={logoLightFile}
								server={{
									process: '/api/v1/file/upload',
									revert: '/api/v1/file/revert',
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									load: (source: any, load: any, error: any) => {
										fetch(source)
											.then((response) => response.blob())
											.then((blob) => {
												load(blob);
											})
											.catch((err) => {
												error(err.message);
											});
									}
								}}
								onprocessfile={(error: FilePondErrorDescription | null, file: FilePondFile) => {
									if (!error) {
										console.log('Logo Light serverId:', file.serverId);
										$formData.logo_light = file.serverId;
									}
								}}
								acceptedFileTypes={['image/png', 'image/jpeg', 'image/svg+xml']}
								allowMultiple={false}
							/>
							<!-- hidden input agar ikut terkirim -->
							<input type="hidden" name="logo_light" bind:value={$formData.logo_light} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="logo_dark">
						<Form.Control>
							<Form.Label>{m.label_logo_dark()}</Form.Label>
							<!-- server: api ke /tmp (routes/api/v1/file/<upload or revert>) -->
							<FilePond
								files={logoDarkFile}
								server={{
									process: '/api/v1/file/upload', // endpoint upload
									revert: '/api/v1/file/revert', // endpoint hapus
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									load: (source: any, load: any, error: any) => {
										fetch(source)
											.then((response) => response.blob())
											.then((blob) => {
												load(blob);
											})
											.catch((err) => {
												error(err.message);
											});
									}
								}}
								onprocessfile={(error: FilePondErrorDescription | null, file: FilePondFile) => {
									if (!error) {
										console.log('Logo Dark serverId:', file.serverId);
										$formData.logo_dark = file.serverId;
									}
								}}
								acceptedFileTypes={['image/png', 'image/jpeg', 'image/svg+xml']}
								allowMultiple={false}
							/>
							<input type="hidden" name="logo_dark" bind:value={$formData.logo_dark} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="icon">
						<Form.Control>
							<Form.Label>{m.label_icon()}</Form.Label>
							<!-- server: api ke /tmp (routes/api/v1/file/<upload or revert>) -->
							<FilePond
								files={iconFile}
								server={{
									process: '/api/v1/file/upload', // endpoint upload
									revert: '/api/v1/file/revert', // endpoint hapus
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									load: (source: any, load: any, error: any) => {
										fetch(source)
											.then((response) => response.blob())
											.then((blob) => {
												load(blob);
											})
											.catch((err) => {
												error(err.message);
											});
									}
								}}
								onprocessfile={(error: FilePondErrorDescription | null, file: FilePondFile) => {
									if (!error) {
										console.log('Icon serverId:', file.serverId);
										$formData.icon = file.serverId;
									}
								}}
								acceptedFileTypes={['image/x-icon', 'image/png']}
								allowMultiple={false}
							/>
							<input type="hidden" name="icon" bind:value={$formData.icon} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<div class="mt-6 flex justify-end gap-2">
					<!-- <Form.Button type="reset" variant="secondary" size="sm">Reset</Form.Button> -->
					{#if $delayed}
						<Button disabled size="sm">
							<LoaderCircle class="mr-2 size-4 animate-spin" />
							{m.btn_wait()}
						</Button>
					{:else}
						<Form.Button type="submit" size="sm">{m.btn_save()}</Form.Button>
					{/if}
				</div>
			</form>
		</div>
	</div>
</div>
