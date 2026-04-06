<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';
	import SectionOrganization from '$lib/components/guest/sections/section-organization.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
	import type { FilePondErrorDescription, FilePondFile } from 'filepond';
	import * as m from '$lib/paraglide/messages.js';

	registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	type EmployeeDetail = PageData['employees'][number];

	let selectedEmployee = $state<EmployeeDetail | null>(null);
	let isEditDialogOpen = $state(false);

	type FilePondInitialFile = {
		source: string;
		options: {
			type: 'local';
		};
	};
	let avatarFile: (File | FilePondInitialFile)[] = $state([]);
	let avatarServerId = $state<string>('');

	function openEditModal(employee: EmployeeDetail) {
		selectedEmployee = { ...employee };
		avatarServerId = '';
		if (selectedEmployee.user?.avatar) {
			avatarFile = [{ source: selectedEmployee.user.avatar, options: { type: 'local' } }];
		} else {
			avatarFile = [];
		}
		isEditDialogOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
			isEditDialogOpen = false;
		} else if (form?.message) {
			toast.error(form.message);
		}
	});

	// Transform data for preview - only show public ones
	let previewTeams = $derived(
		data.employees
			.filter((emp: EmployeeDetail) => emp.isPublic)
			.map((emp: EmployeeDetail) => ({
				id: emp.id,
				name: emp.user?.name || 'Unknown',
				position: emp.position?.name || 'N/A',
				image: emp.user?.avatar || 'https://ui-avatars.com/api/?name=Unknown',
				reportsTo: emp.reportsTo,
				division: emp.division
			}))
	);
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Manajemen Organisasi
			</h1>
			<p class="text-muted-foreground">
				Atur hirarki pelaporan dan pembagian divisi untuk tim Anda.
			</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Management Table -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Daftar Karyawan</Card.Title>
				<Card.Description>Edit informasi struktur untuk setiap anggota tim.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="h-[500px] overflow-auto rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Nama</Table.Head>
								<Table.Head>Posisi</Table.Head>
								<Table.Head>Divisi</Table.Head>
								<Table.Head>Visibilitas</Table.Head>
								<Table.Head class="text-right">Aksi</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.employees as emp (emp.id)}
								<Table.Row>
									<Table.Cell>
										<div class="flex items-center gap-3">
											<img
												src={emp.user?.avatar ||
													'https://ui-avatars.com/api/?name=' + emp.user?.name}
												alt={emp.user?.name}
												class="h-8 w-8 rounded-full object-cover"
											/>
											<div class="flex flex-col">
												<span class="font-medium">{emp.user?.name}</span>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs"
										>{emp.position?.name || '-'}</Table.Cell
									>
									<Table.Cell>
										{#if emp.division}
											<span
												class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-900/20 dark:text-blue-300"
											>
												{emp.division}
											</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if emp.isPublic}
											<Badge variant="outline" class="border-green-500 text-green-600"
												>Terlihat</Badge
											>
										{:else}
											<Badge variant="outline" class="border-gray-400 text-gray-500"
												>Tersembunyi</Badge
											>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button variant="ghost" size="sm" onclick={() => openEditModal(emp)}
											>Atur</Button
										>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Visual Preview -->
		<Card.Root class="flex flex-col">
			<Card.Header>
				<Card.Title>Pratinjau Struktur</Card.Title>
				<Card.Description>Visualisasi hirarki yang akan tampil di website.</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1 overflow-auto bg-slate-50/50 p-4 dark:bg-slate-900/20">
				<div class="min-h-[500px] w-full origin-top transform">
					<SectionOrganization teams={previewTeams} />
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<!-- Edit Modal -->
<Dialog.Root bind:open={isEditDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Atur Organisasi</Dialog.Title>
			<Dialog.Description
				>Perbarui data manajemen untuk {selectedEmployee?.user?.name}.</Dialog.Description
			>
		</Dialog.Header>

		{#if selectedEmployee}
			<form
				method="POST"
				action="?/update"
				use:enhance
				enctype="multipart/form-data"
				class="grid gap-4 py-4"
			>
				<input type="hidden" name="id" value={selectedEmployee.id} />
				<input type="hidden" name="userId" value={selectedEmployee.userId} />

				<div class="grid gap-2">
					<Label for="avatar">Foto Profil (Avatar)</Label>
					<FilePond
						files={avatarFile}
						server={{
							process: '/api/file/upload',
							revert: '/api/file/revert',
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
								avatarServerId = file.serverId;
							}
						}}
						acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
						allowMultiple={false}
					/>
					<input type="hidden" name="avatar" value={avatarServerId} />
				</div>

				<div class="grid gap-2">
					<Label for="positionId">Jabatan</Label>
					<select
						name="positionId"
						id="positionId"
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						value={selectedEmployee.positionId}
					>
						<option value="">Pilih Jabatan</option>
						{#each data.positions as pos (pos.id)}
							<option value={pos.id}>{pos.name}</option>
						{/each}
					</select>
				</div>

				<div class="grid gap-2">
					<Label for="reportsTo">Atasan Langsung</Label>
					<select
						name="reportsTo"
						id="reportsTo"
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						value={selectedEmployee.reportsTo}
					>
						<option value="">Tanpa Atasan (Level Tertinggi)</option>
						{#each data.employees.filter((e: EmployeeDetail) => e.id !== selectedEmployee?.id) as supervisor (supervisor.id)}
							<option value={supervisor.id}>{supervisor.user?.name}</option>
						{/each}
					</select>
				</div>

				<div class="grid gap-2">
					<Label for="division">Divisi</Label>
					<Input
						name="division"
						id="division"
						placeholder="Contoh: Engineering, Finance"
						value={selectedEmployee.division || ''}
					/>
				</div>

				<div class="flex items-center justify-between rounded-lg border p-3">
					<div class="space-y-0.5">
						<Label for="isPublic" class="text-base">Tampilkan di Struktur</Label>
						<p class="text-muted-foreground text-xs">
							Jika dinonaktifkan, user ini tidak akan muncul di bagan organisasi.
						</p>
					</div>
					<Switch
						name="isPublic"
						id="isPublic"
						value="true"
						checked={selectedEmployee.isPublic ?? true}
					/>
				</div>

				<Dialog.Footer>
					<Button type="submit" class="w-full">{m.btn_save_changes()}</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
