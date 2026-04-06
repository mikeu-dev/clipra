<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Users from '@lucide/svelte/icons/users';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let isDeleteDialogOpen = $state(false);
	let jobToDelete = $state('');

	// Permissions
	const canCreate = ['admin', 'manager', 'director', 'hr'].some((r) =>
		data.userRole?.toLowerCase().includes(r)
	);

	let search = $state($page.url.searchParams.get('search') || '');
	let typingTimer: any; // eslint-disable-line @typescript-eslint/no-explicit-any

	function handleSearch(value: string) {
		search = value;
		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (value) url.searchParams.set('search', value);
			else url.searchParams.delete('search');
			url.searchParams.set('page', '1');
			goto(localizeHref(url.toString()));
		}, 500);
	}

	function confirmDelete(id: string) {
		jobToDelete = id;
		isDeleteDialogOpen = true;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'published':
				return 'bg-green-500 hover:bg-green-600';
			case 'draft':
				return 'bg-gray-500 hover:bg-gray-600';
			case 'closed':
				return 'bg-red-500 hover:bg-red-600';
			default:
				return 'bg-primary';
		}
	}
</script>

<svelte:head>
	<title>Karir & Lowongan - Panel</title>
</svelte:head>

<div class="flex flex-1 flex-col gap-4 p-4 md:p-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.career_management()}
			</h2>
			<p class="text-muted-foreground">{m.career_desc_manage()}</p>
		</div>
		<div class="flex items-center gap-2">
			<div class="relative w-full md:w-64">
				<Search class="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
				<Input
					placeholder={m.label_search_jobs()}
					class="pl-8"
					value={search}
					oninput={(e) => handleSearch(e.currentTarget.value)}
				/>
			</div>
			{#if canCreate}
				<Button href={localizeHref('/panel/career/create')}
					><Plus class="mr-2 h-4 w-4" /> {m.btn_add_career()}</Button
				>
			{/if}
		</div>
	</div>

	{#if data.jobs.length === 0}
		<div
			class="flex h-[400px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center"
		>
			<div class="bg-muted rounded-full p-3">
				<Briefcase class="text-muted-foreground h-6 w-6" />
			</div>
			<h3 class="text-lg font-semibold">{m.label_no_jobs()}</h3>
			<p class="text-muted-foreground text-sm">
				{search ? m.msg_no_jobs_search() : m.msg_no_jobs_new()}
			</p>
			{#if canCreate && !search}
				<Button class="mt-4" href={localizeHref('/panel/career/create')}
					><Plus class="mr-2 h-4 w-4" /> {m.btn_create_job()}</Button
				>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.jobs as job (job.id)}
				<Card.Root class="hover:border-primary/50 group relative h-full transition-colors">
					<Card.Header>
						<div class="flex items-start justify-between">
							<div class="flex-1 space-y-1">
								<div class="flex items-center justify-between">
									<Badge class={getStatusColor(job.status)}>{job.status}</Badge>
								</div>
								<Card.Title class="group-hover:text-primary pt-2 text-xl">
									{job.title}
								</Card.Title>
								<div class="text-muted-foreground flex items-center gap-2 text-sm">
									<MapPin class="h-3 w-3" />
									{job.location}
								</div>
								<div class="text-muted-foreground flex items-center gap-2 text-sm">
									<Clock class="h-3 w-3" />
									{job.type}
								</div>
							</div>

							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} variant="ghost" size="icon" class="-mr-2 h-8 w-8">
											<EllipsisVertical class="h-4 w-4" />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Item onclick={() => goto(localizeHref(`/panel/career/${job.id}`))}>
										<Pencil class="mr-2 h-4 w-4" />
										{m.action_edit()}
									</DropdownMenu.Item>
									<DropdownMenu.Item
										onclick={() => goto(localizeHref(`/panel/career/${job.id}/applicants`))}
									>
										<Users class="mr-2 h-4 w-4" />
										{m.label_applicants()}
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="text-destructive focus:text-destructive"
										onclick={() => confirmDelete(job.id)}
									>
										<Trash2 class="mr-2 h-4 w-4" />
										{m.action_delete()}
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</Card.Header>
					<Card.Footer class="border-t pt-4">
						<div class="text-muted-foreground flex w-full items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<Users class="h-4 w-4" />
								<span>
									{job.applicantCount || 0}
									{m.label_applicants()}
								</span>
							</div>
							<span class="text-xs text-neutral-500"
								>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span
							>
						</div>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		<div class="mt-4 flex justify-center">
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={data.page <= 1}
					onclick={() => goto(localizeHref(`?page=${data.page - 1}`))}>{m.btn_previous()}</Button
				>
				<span class="text-muted-foreground flex items-center text-sm"
					>{m.label_page()} {data.page}</span
				>
				<Button
					variant="outline"
					size="sm"
					disabled={data.jobs.length < data.limit}
					onclick={() => goto(localizeHref(`?page=${data.page + 1}`))}>{m.btn_next()}</Button
				>
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.dialog_delete_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				Aksi ini tidak dapat dibatalkan. Lowongan dan semua data pelamar terkait akan dihapus secara
				permanen.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={jobToDelete} />
				<Button variant="destructive" type="submit" onclick={() => (isDeleteDialogOpen = false)}>
					{m.action_delete()}
				</Button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
