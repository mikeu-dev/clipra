<script lang="ts">
	import { untrack } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import {
		announcementFormSchema,
		type AnnouncementFormSchema
	} from '$lib/schemas/announcement/form';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import RichEditor from '$lib/components/rich-editor/rich-editor.svelte';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import { Badge } from '$lib/components/ui/badge';
	import Calendar from '@lucide/svelte/icons/calendar';
	import * as m from '$lib/paraglide/messages.js';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	let { data } = $props<{ data: PageData }>();

	const form = superForm(
		untrack(() => data.form as SuperValidated<Infer<AnnouncementFormSchema>>),
		{
			validators: zodClient(announcementFormSchema),
			onResult: ({ result }) => {
				if (result.type === 'failure' || result.type === 'error') {
					toast.error(m.toast_error_announcement_created());
				} else if (result.type === 'redirect') {
					toast.success(m.toast_success_announcement_created());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let attachmentFiles = $state<unknown[]>([]);
	let attachmentServerIds = $state<string[]>([]);
	let selectedRoles = $state<string[]>([]);
	let selectedUsers = $state<string[]>([]);
	let userSearch = $state('');
	let roleSearch = $state('');

	let filteredUsers = $derived(
		data.users.filter(
			(u: (typeof data.users)[0]) =>
				u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
				u.email.toLowerCase().includes(userSearch.toLowerCase())
		)
	);

	let filteredRoles = $derived(
		data.roles.filter((r: (typeof data.roles)[0]) =>
			r.name.toLowerCase().includes(roleSearch.toLowerCase())
		)
	);

	let contentRawLength = $derived(
		$formData.content
			? $formData.content
					.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, ' ')
					.replace(/<[^>]*>?/gm, '')
					.replace(/&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ')
					.replace(/[\r\n\t]+/g, ' ')
					.replace(/\s+/g, ' ')
					.trim().length
			: 0
	);

	function toggleRole(roleId: string) {
		if (selectedRoles.includes(roleId)) {
			selectedRoles = selectedRoles.filter((r) => r !== roleId);
		} else {
			selectedRoles = [...selectedRoles, roleId];
		}
		$formData.targetValue = JSON.stringify(selectedRoles);
	}

	function toggleUser(userId: string) {
		if (selectedUsers.includes(userId)) {
			selectedUsers = selectedUsers.filter((u) => u !== userId);
		} else {
			selectedUsers = [...selectedUsers, userId];
		}
		$formData.targetValue = JSON.stringify(selectedUsers);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleProcessFile = (_error: any, file: any) => {
		if (!_error && file?.serverId) {
			attachmentServerIds = [...attachmentServerIds, file.serverId];
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleRemoveFile = (_error: any, file: any) => {
		if (file?.serverId) {
			attachmentServerIds = attachmentServerIds.filter((id) => id !== file.serverId);
		}
	};
</script>

<svelte:head>
	<title>Buat Pengumuman</title>
	<meta name="description" content="Buat pengumuman baru" />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
			>
				<Megaphone class="h-5 w-5" />
			</div>
			<div>
				<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
					Buat Pengumuman
				</h2>
				<p class="text-muted-foreground">Buat dan kirim pengumuman ke pengguna.</p>
			</div>
		</div>
	</div>
	<Separator />

	<div class="max-w-7xl">
		<form method="POST" enctype="multipart/form-data" use:enhance class="grid gap-8 lg:grid-cols-3">
			<!-- Main Content: Left Column -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Title -->
				<Form.Field {form} name="title">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Judul Pengumuman</Form.Label>
							<Input
								{...props}
								bind:value={$formData.title}
								placeholder="Masukkan judul pengumuman"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="content">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between pb-2">
								<Form.Label>Konten Pengumuman</Form.Label>
								<span
									class="text-xs transition-colors {contentRawLength < 10 &&
									$formData.content !== ''
										? 'font-medium text-orange-500'
										: 'text-slate-400'}"
								>
									{contentRawLength < 10
										? `Kurang ${10 - contentRawLength} karakter teks lagi`
										: `${contentRawLength} karakter`}
								</span>
							</div>
							<RichEditor bind:value={$formData.content} />
							<input type="hidden" name={props.name} bind:value={$formData.content} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Sidebar: Right Column -->
			<div class="flex flex-col space-y-6">
				<!-- Status (Moved to top of sidebar) -->
				<Form.Field {form} name="status">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>{m.btn_save_as()}</Form.Label>
							<Select.Root type="single" bind:value={$formData.status} name={props.name}>
								<Select.Trigger {...props} class="w-full">
									{$formData.status === 'published' ? m.btn_publish_now() : m.btn_save_draft()}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="draft" label="Draft">{m.btn_save_draft()}</Select.Item>
									<Select.Item value="published" label="Publish">{m.btn_publish_now()}</Select.Item>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.Description>
						{#if $formData.status === 'published'}
							Akan langsung dikirim ke semua target.
						{:else}
							Disimpan sebagai draft terlebih dahulu.
						{/if}
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<div class="grid grid-cols-2 gap-4">
					<!-- Priority -->
					<Form.Field {form} name="priority">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Prioritas</Form.Label>
								<Select.Root type="single" bind:value={$formData.priority} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.priority === 'urgent' ? 'Urgent' : 'Normal'}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="normal" label="Normal">Normal</Select.Item>
										<Select.Item value="urgent" label="Urgent">Urgent</Select.Item>
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Target Type -->
					<Form.Field {form} name="targetType">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Target Penerima</Form.Label>
								<Select.Root type="single" bind:value={$formData.targetType} name={props.name}>
									<Select.Trigger {...props} class="w-full">
										{$formData.targetType === 'all'
											? 'Semua User'
											: $formData.targetType === 'role'
												? 'Per Role'
												: $formData.targetType === 'user'
													? m.placeholder_select_user()
													: m.placeholder_select_target()}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="all" label="Semua User">Semua User</Select.Item>
										<Select.Item value="role" label="Per Role">Per Role</Select.Item>
										<Select.Item value="user" label={m.placeholder_select_user()}
											>{m.placeholder_select_user()}</Select.Item
										>
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>

				<!-- Expiration Date -->
				<Form.Field {form} name="expiresAt">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="flex items-center gap-2">
								<Calendar class="h-3.5 w-3.5" /> Berlaku Sampai (Opsional)
							</Form.Label>
							<Input
								{...props}
								type="datetime-local"
								bind:value={$formData.expiresAt}
								class="w-full"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>
						Pengumuman akan diarsipkan otomatis jika diisi. Biarkan kosong untuk pengumuman
						permanen.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<!-- Target Value: Role Picker -->
				{#if $formData.targetType === 'role'}
					<div class="rounded-lg border p-4">
						<label for="role-search" class="mb-2 block text-sm font-medium">Pilih Role</label>
						<Input
							id="role-search"
							placeholder={m.placeholder_search_role()}
							bind:value={roleSearch}
							class="mb-3 h-8"
						/>
						<div class="flex flex-wrap gap-2">
							{#each filteredRoles as role (role.id)}
								{@const isSelected = selectedRoles.includes(role.id)}
								<button
									type="button"
									class="rounded-full border px-3 py-1 text-xs transition-all {isSelected
										? 'border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
										: 'border-slate-200 text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:text-slate-400'}"
									onclick={() => toggleRole(role.id)}
								>
									{role.name}
								</button>
							{/each}
						</div>
						{#if selectedRoles.length > 0}
							<p class="mt-2 text-xs text-slate-500">
								{m.label_role_selected({ count: selectedRoles.length })}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Target Value: User Picker -->
				{#if $formData.targetType === 'user'}
					<div class="rounded-lg border p-4">
						<label for="user-search" class="mb-2 block text-sm font-medium">Pilih User</label>
						<Input
							id="user-search"
							placeholder={m.placeholder_search_user()}
							bind:value={userSearch}
							class="mb-3 h-8"
						/>
						<div class="max-h-48 space-y-1 overflow-y-auto">
							{#each filteredUsers as user (user.id)}
								{@const isSelected = selectedUsers.includes(user.id)}
								<button
									type="button"
									class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-all {isSelected
										? 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
										: 'hover:bg-slate-50 dark:hover:bg-slate-800'}"
									onclick={() => toggleUser(user.id)}
								>
									<div>
										<span class="font-medium">{user.name}</span>
										<span class="ml-2 text-xs text-slate-400">{user.email}</span>
									</div>
									{#if isSelected}
										<Badge variant="outline" class="border-violet-300 text-[10px] text-violet-600"
											>✓</Badge
										>
									{/if}
								</button>
							{/each}
						</div>
						{#if selectedUsers.length > 0}
							<p class="mt-2 text-xs text-slate-500">
								{m.label_user_selected({ count: selectedUsers.length })}
							</p>
						{/if}
					</div>
				{/if}

				<input type="hidden" name="targetValue" bind:value={$formData.targetValue} />

				<!-- File Attachments -->
				<div>
					<span class="mb-2 block text-sm font-medium">Lampiran (opsional)</span>
					<FilePond
						files={attachmentFiles}
						server={{
							process: '/api/file/upload',
							revert: null
						}}
						allowMultiple={true}
						acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp', 'application/pdf']}
						onprocessfile={handleProcessFile}
						onremovefile={handleRemoveFile}
						labelIdle={m.label_filepond_drag_drop()}
					/>
					{#each attachmentServerIds as serverId (serverId)}
						<input type="hidden" name="attachments" value={serverId} />
					{/each}
				</div>

				<!-- Submit -->
				<div
					class="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"
				>
					<Button variant="outline" href="/panel/announcements">{m.btn_cancel()}</Button>
					<Button type="submit" disabled={$delayed}>
						{#if $delayed}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{$formData.status === 'published' ? m.btn_publish_announcement() : m.btn_save_draft()}
					</Button>
				</div>
			</div>
		</form>
	</div>
</div>
