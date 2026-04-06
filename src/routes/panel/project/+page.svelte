<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Calendar from '@lucide/svelte/icons/calendar';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { projectSchema } from '$lib/schemas/project';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import 'filepond/dist/filepond.min.css';
	import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { ProjectSchema } from '$lib/schemas/project';

	// Superform setup
	const form = superForm(
		untrack(() => data.form as SuperValidated<Infer<ProjectSchema>>),
		{
			validators: zodClient(projectSchema),
			onResult: async ({ result }) => {
				if (result.type === 'success') {
					toast.success(isEditMode ? m.msg_project_updated() : m.msg_project_created());
					isDialogOpen = false;
					await goto(localizeHref('/panel/project'), { invalidateAll: true });
				} else if (result.type === 'error') {
					toast.error(result.error?.message || m.msg_operation_failed());
				}
			}
		}
	);

	const { form: formData, enhance, delayed } = form;
	let isDialogOpen = $state(false);
	let isEditMode = $state(false);
	let isDeleteDialogOpen = $state(false);
	let projectToDelete = $state('');
	let currentThumbnail = $state('');

	// Projects
	const canCreate = ['admin', 'manager', 'director'].some((r) =>
		data.userRole?.toLowerCase().includes(r)
	);

	let search = $state($page.url.searchParams.get('search') || '');
	let typingTimer: ReturnType<typeof setTimeout>;

	function handleSearch(value: string) {
		search = value;
		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (value) url.searchParams.set('search', value);
			else url.searchParams.delete('search');
			url.searchParams.set('page', '1'); // Reset to page 1
			void goto(localizeHref(url.toString()));
		}, 500);
	}

	function formatDate(date: string | Date | null) {
		if (!date) return 'No date';
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.substring(0, 2)
			.toUpperCase();
	}

	function openCreate() {
		isEditMode = false;
		form.reset();
		currentThumbnail = '';
		isDialogOpen = true;
	}

	type Project = (typeof data.projects)[number];

	function openEdit(project: Project) {
		// TODO: Define Project type properly
		isEditMode = true;
		$formData.id = project.id;
		$formData.name = project.name;
		$formData.description = project.description || '';
		$formData.clientId = project.clientId;
		// Dates need to be YYYY-MM-DD
		$formData.startDate = project.startDate
			? new Date(project.startDate).toISOString().split('T')[0]
			: '';
		$formData.dueDate = project.dueDate
			? new Date(project.dueDate).toISOString().split('T')[0]
			: '';
		$formData.isPortfolio = !!project.isPortfolio;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		$formData.memberIds = project.projectUsers.map((pu: any) => pu.user.id);
		$formData.totalBudget = project.totalBudget || 0;
		$formData.estimatedHours = project.estimatedHours || 0;
		$formData.latitude = project.latitude || '';
		$formData.longitude = project.longitude || '';

		isDialogOpen = true;
	}

	function confirmDelete(id: string) {
		projectToDelete = id;
		isDeleteDialogOpen = true;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function handleProcessFile(error: any, file: any) {
		if (!error && file.serverId) {
			$formData.thumbnail = file.serverId;
		}
	}

	function handleRemoveFile() {
		$formData.thumbnail = '';
	}

	const filePondServer = {
		process: '/api/file/upload',
		revert: null,
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
	};
</script>

<svelte:head>
	<title>{m.project_title()}</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.project_title()}
			</h2>
			<p class="text-muted-foreground">{m.project_desc()}</p>
			{#if data.filteredClient}
				<div class="mt-2 flex items-center gap-2">
					<Badge variant="outline" class="gap-1 py-1 pr-1 pl-2">
						Filter berdasarkan Klien: {data.filteredClient.name}
						<Button
							variant="ghost"
							size="icon"
							class="hover:bg-muted h-4 w-4 rounded-full"
							onclick={async () => {
								const url = new URL($page.url);
								url.searchParams.delete('client');
								url.searchParams.set('page', '1');
								await goto(localizeHref(url.toString()));
							}}
						>
							<X class="h-3 w-3" />
						</Button>
					</Badge>
				</div>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<div class="relative w-full md:w-64">
				<Search class="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					placeholder={m.placeholder_search_projects()}
					class="pl-8"
					value={search}
					oninput={(e) => handleSearch(e.currentTarget.value)}
				/>
			</div>
			<Button variant="outline" href="/panel/project/export" target="_blank"
				>{m.btn_export_report()}</Button
			>
			{#if canCreate}
				<Button onclick={openCreate}><Plus class="mr-2 h-4 w-4" /> {m.btn_new_project()}</Button>
			{/if}
		</div>
	</div>

	{#if data.projects.length === 0}
		<div
			class="flex h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center"
		>
			<div class="bg-muted rounded-full p-3">
				<Calendar class="text-muted-foreground h-6 w-6" />
			</div>
			<h3 class="text-lg font-semibold">{m.msg_no_projects()}</h3>
			<p class="text-muted-foreground text-sm">
				{search ? m.msg_no_projects_search() : m.msg_no_projects_new()}
			</p>
			{#if canCreate && !search}
				<Button class="mt-4" onclick={openCreate}
					><Plus class="mr-2 h-4 w-4" /> {m.btn_create_project()}</Button
				>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.projects as project (project.id)}
				<Card.Root class="hover:border-primary/50 group relative block h-full transition-colors">
					<Card.Header>
						<div class="flex items-start justify-between">
							<div
								class="cursor-pointer"
								onclick={() => void goto(localizeHref(`/panel/project/${project.id}`))}
								role="button"
								tabindex="0"
								onkeydown={(e) =>
									e.key === 'Enter' && void goto(localizeHref(`/panel/project/${project.id}`))}
							>
								<Card.Title class="group-hover:text-primary">{project.name}</Card.Title>
								<Card.Description>{project.client?.name || m.label_no_client()}</Card.Description>
							</div>

							<div class="flex items-center gap-2">
								<Badge variant={project.status === 'active' ? 'default' : 'secondary'}
									>{project.status}</Badge
								>
								{#if canCreate}
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											{#snippet child({ props })}
												<Button {...props} variant="ghost" size="icon" class="-mr-2 h-8 w-8">
													<EllipsisVertical class="h-4 w-4" />
												</Button>
											{/snippet}
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => openEdit(project)}>
												<Pencil class="mr-2 h-4 w-4" />
												{m.action_edit()}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												class="text-destructive focus:text-destructive"
												onclick={() => confirmDelete(project.id)}
											>
												<Trash2 class="mr-2 h-4 w-4" />
												{m.action_delete()}
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								{/if}
							</div>
						</div>
					</Card.Header>
					<Card.Content
						class="cursor-pointer"
						onclick={() => void goto(`/panel/project/${project.id}`)}
					>
						<p class="text-muted-foreground line-clamp-2 text-sm">
							{project.description || m.label_no_desc()}
						</p>
						<div class="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
							<div class="flex items-center gap-1">
								<Calendar class="h-3 w-3" />
								<span>{m.label_due()}: {formatDate(project.dueDate)}</span>
							</div>
						</div>
					</Card.Content>
					<Card.Footer
						class="flex cursor-pointer justify-between border-t p-4"
						onclick={() => void goto(`/panel/project/${project.id}`)}
					>
						<div class="flex -space-x-2">
							{#if project.projectUsers && project.projectUsers.length > 0}
								{#each project.projectUsers.slice(0, 4) as pu (pu.user.id)}
									<Avatar.Root class="border-background h-8 w-8 border-2">
										<Avatar.Fallback>{getInitials(pu.user.name)}</Avatar.Fallback>
									</Avatar.Root>
								{/each}
								{#if project.projectUsers.length > 4}
									<div
										class="border-background bg-muted flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium"
									>
										+{project.projectUsers.length - 4}
									</div>
								{/if}
							{:else}
								<span class="text-muted-foreground text-xs italic">{m.label_no_members()}</span>
							{/if}
						</div>
						<div class="text-muted-foreground text-xs">
							{project.projectUsers?.length || 0}
							{m.label_members()}
						</div>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>

		<!-- Semantic Pagination -->
		<div class="mt-4 flex justify-center">
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={data.page <= 1}
					onclick={() => void goto(localizeHref(`?page=${data.page - 1}`))}
					>{m.btn_previous()}</Button
				>
				<span class="text-muted-foreground flex items-center text-sm"
					>{m.label_page()} {data.page}</span
				>
				<Button
					variant="outline"
					size="sm"
					disabled={data.projects.length < data.limit}
					onclick={() => void goto(localizeHref(`?page=${data.page + 1}`))}>{m.btn_next()}</Button
				>
			</div>
		</div>
	{/if}
</div>

<!-- Create/Edit Project Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? m.dialog_edit_project() : m.dialog_create_project()}</Dialog.Title
			>
			<Dialog.Description
				>{isEditMode
					? m.dialog_edit_project_desc()
					: m.dialog_create_project_desc()}</Dialog.Description
			>
		</Dialog.Header>
		<form
			method="POST"
			action={isEditMode ? '?/update' : '?/create'}
			use:enhance
			enctype="multipart/form-data"
			class="grid gap-4 py-4"
		>
			{#if isEditMode}
				<input type="hidden" name="id" value={$formData.id} />
			{/if}

			<Form.Field {form} name="name">
				<Label>{m.label_project_name()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							bind:value={$formData.name}
							placeholder={m.placeholder_project_name()}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="clientId">
				<Label>{m.label_client()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Select.Root type="single" bind:value={$formData.clientId} name={props.name}>
							<Select.Trigger {...props} class="w-full">
								{$formData.clientId
									? data.options.clients.find((c) => c.id === $formData.clientId)?.name
									: m.placeholder_select_client()}
							</Select.Trigger>
							<Select.Content>
								{#each data.options.clients as client (client.id)}
									<Select.Item value={client.id} label={client.name}>{client.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="description">
				<Label>{m.label_description()}</Label>
				<Form.Control>
					{#snippet children({ props })}
						<Textarea
							{...props}
							bind:value={$formData.description as string}
							placeholder={m.placeholder_project_goals()}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="startDate">
					<Label>{m.label_start_date()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input type="date" {...props} bind:value={$formData.startDate} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="dueDate">
					<Label>{m.label_due_date()}</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input type="date" {...props} bind:value={$formData.dueDate} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="totalBudget">
					<Label>Total Budget (IDR)</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input
								type="number"
								{...props}
								bind:value={$formData.totalBudget}
								placeholder="Contoh: 50000000"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="estimatedHours">
					<Label>Estimasi Jam</Label>
					<Form.Control>
						{#snippet children({ props })}
							<Input
								type="number"
								{...props}
								bind:value={$formData.estimatedHours}
								placeholder="Contoh: 160"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="latitude">
					<Form.Control>
						{#snippet children({ props })}
							<Label>Latitude</Label>
							<Input {...props} bind:value={$formData.latitude} placeholder="-6.1754" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="longitude">
					<Form.Control>
						{#snippet children({ props })}
							<Label>Longitude</Label>
							<Input {...props} bind:value={$formData.longitude} placeholder="106.8272" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox id="isPortfolio" bind:checked={$formData.isPortfolio as boolean | undefined} />
				<Label for="isPortfolio">Tampilkan di Halaman Publik</Label>
			</div>

			<div class="space-y-2">
				<Label>Thumbnail Proyek</Label>
				<FilePond
					name="thumbnailFile"
					server={filePondServer}
					files={currentThumbnail ? [{ source: currentThumbnail, options: { type: 'local' } }] : []}
					acceptedFileTypes={['image/*']}
					onprocessfile={handleProcessFile}
					onremovefile={handleRemoveFile}
					labelIdle="Seret gambar ke sini atau <span class='filepond--label-action'>Pilih Gambar</span>"
				/>
				<input type="hidden" name="thumbnail" bind:value={$formData.thumbnail} />
			</div>

			<!-- Members Selection (Checkbox List) -->
			<div class="space-y-2">
				<Label>{m.label_assign_members()}</Label>
				<div class="h-40 space-y-2 overflow-y-auto rounded-md border p-4">
					{#each data.options.users as user (user.id)}
						<div class="flex items-center space-x-2">
							<Checkbox
								id="user-{user.id}"
								checked={($formData.memberIds as string[]).includes(user.id)}
								onCheckedChange={(v) => {
									if (v) {
										$formData.memberIds = [...($formData.memberIds as string[]), user.id];
									} else {
										$formData.memberIds = ($formData.memberIds as string[]).filter(
											(id) => id !== user.id
										);
									}
								}}
							/>
							<Label for="user-{user.id}" class="text-sm font-normal">
								{user.name}
								<span class="text-muted-foreground text-xs">({user.role || 'Tanpa Role'})</span>
							</Label>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex justify-end pt-4">
				{#if $delayed}
					<Button disabled>
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{isEditMode ? m.btn_updating() : m.btn_creating()}
					</Button>
				{:else}
					<Button type="submit">{isEditMode ? m.btn_update() : m.btn_create()}</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.dialog_delete_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.dialog_delete_project_desc()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={projectToDelete} />
				<Button variant="destructive" type="submit" onclick={() => (isDeleteDialogOpen = false)}>
					{m.action_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
