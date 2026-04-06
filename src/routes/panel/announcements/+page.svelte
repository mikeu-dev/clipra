<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { formatDistanceToNow } from 'date-fns';
	import { id as idLocale } from 'date-fns/locale';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Plus from '@lucide/svelte/icons/plus';
	import Send from '@lucide/svelte/icons/send';
	import Archive from '@lucide/svelte/icons/archive';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Eye from '@lucide/svelte/icons/eye';
	import Users from '@lucide/svelte/icons/users';
	import Shield from '@lucide/svelte/icons/shield';
	import User from '@lucide/svelte/icons/user';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { data } = $props();

	let announcements = $derived(data.announcements || []);
	let total = $derived(data.total || 0);
	let currentPage = $derived(data.currentPage || 1);
	let limit = $derived(data.limit || 20);
	let activeFilter = $derived(data.activeFilter || 'all');
	let totalPages = $derived(Math.ceil(total / limit));

	const filters = $derived([
		{ id: 'all', label: m.filter_all() },
		{ id: 'draft', label: m.filter_draft() },
		{ id: 'published', label: m.filter_published() },
		{ id: 'archived', label: m.filter_archived() }
	]);

	function setFilter(filterId: string) {
		const url = new URL(page.url);
		if (filterId === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', filterId);
		}
		url.searchParams.set('page', '1');
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function goToPage(p: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', p.toString());
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function getStatusBadge(status: string | null) {
		switch (status) {
			case 'published':
				return {
					label: m.filter_published(),
					class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
				};
			case 'archived':
				return {
					label: m.filter_archived(),
					class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
				};
			default:
				return {
					label: m.filter_draft(),
					class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
				};
		}
	}

	function getTargetLabel(targetType: string | null) {
		switch (targetType) {
			case 'all':
				return { label: m.target_all_users(), icon: Users };
			case 'role':
				return { label: m.target_per_role(), icon: Shield };
			case 'user':
				return { label: m.target_specific_user(), icon: User };
			default:
				return { label: '-', icon: Users };
		}
	}
</script>

<svelte:head>
	<title>{m.announcement_title()}</title>
	<meta name="description" content={m.announcement_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<!-- Header -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
			>
				<Megaphone class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
					{m.announcement_title()}
				</h1>
				<p class="text-muted-foreground">
					{m.announcement_total({ total })}
				</p>
			</div>
		</div>

		{#if data.permissions?.includes('announcements.create')}
			<Button href="/panel/announcements/create" size="sm" variant="outline">
				<Plus class="mr-2 h-4 w-4" />
				{m.btn_create_announcement()}
			</Button>
		{/if}
	</div>

	<!-- Filter Tabs -->
	<div class="flex flex-wrap gap-2">
		{#each filters as filter (filter.id)}
			{@const isActive = activeFilter === filter.id}
			<Button
				variant={isActive ? 'default' : 'outline'}
				size="sm"
				class="transition-all {isActive ? 'shadow-md' : 'hover:shadow-sm'}"
				onclick={() => setFilter(filter.id)}
			>
				{filter.label}
			</Button>
		{/each}
	</div>

	<Separator />

	<!-- Empty State -->
	{#if announcements.length === 0}
		<Card.Root class="flex flex-col items-center justify-center border-dashed py-16 text-center">
			<Card.Content>
				<div
					class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
				>
					<Megaphone class="h-10 w-10 text-slate-400" />
				</div>
				<h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
					{m.announcement_empty_title()}
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					{#if activeFilter !== 'all'}
						{m.announcement_empty_filter({
							status: filters.find((f) => f.id === activeFilter)?.label || ''
						})}
					{:else}
						{m.announcement_empty_desc()}
					{/if}
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Announcement List -->
		<div class="space-y-3">
			{#each announcements as announcement (announcement.id)}
				{@const statusBadge = getStatusBadge(announcement.status)}
				{@const target = getTargetLabel(announcement.targetType)}
				{@const TargetIcon = target.icon}
				<Card.Root class="group transition-all duration-200 hover:shadow-md">
					<div class="flex items-center gap-4 p-4">
						<!-- Content -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<h3 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
									{announcement.title}
								</h3>
								{#if announcement.priority === 'urgent'}
									<Badge variant="destructive" class="text-[10px]">
										<AlertTriangle class="mr-0.5 h-3 w-3" />
										{m.badge_urgent()}
									</Badge>
								{/if}
								<Badge variant="outline" class="text-[10px] {statusBadge.class}">
									{statusBadge.label}
								</Badge>
							</div>
							<div class="mt-1 flex items-center gap-3 text-xs text-slate-400">
								<span class="flex items-center gap-1">
									<TargetIcon class="h-3 w-3" />
									{announcement.targetSummary || target.label}
								</span>
								<span>
									{announcement.createdAt
										? formatDistanceToNow(new Date(announcement.createdAt), {
												addSuffix: true,
												locale: idLocale
											})
										: ''}
								</span>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8 text-slate-400 hover:text-blue-500"
								href="/panel/announcements/{announcement.id}"
								title="Lihat Detail"
							>
								<Eye class="h-4 w-4" />
							</Button>

							{#if announcement.status === 'draft' && data.permissions?.includes('announcements.create')}
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-slate-400 hover:text-emerald-500"
									href="/panel/announcements/{announcement.id}/edit"
									title="Edit Draft"
								>
									<Pencil class="h-4 w-4" />
								</Button>
							{/if}

							{#if announcement.status === 'draft' && data.permissions?.includes('announcements.publish')}
								<form
									action="?/publish"
									method="POST"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												toast.success(m.toast_success_announcement_published());
											}
										};
									}}
								>
									<input type="hidden" name="id" value={announcement.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-slate-400 hover:text-emerald-500"
										title="Publish"
									>
										<Send class="h-4 w-4" />
									</Button>
								</form>
							{/if}

							{#if announcement.status === 'published'}
								<form
									action="?/archive"
									method="POST"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												toast.success('Pengumuman diarsipkan');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={announcement.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-slate-400 hover:text-amber-500"
										title="Arsipkan"
									>
										<Archive class="h-4 w-4" />
									</Button>
								</form>
							{/if}

							{#if data.permissions?.includes('announcements.delete')}
								<form
									action="?/delete"
									method="POST"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												toast.success('Pengumuman dihapus');
											}
										};
									}}
								>
									<input type="hidden" name="id" value={announcement.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-slate-400 hover:text-red-500"
										title="Hapus"
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							{/if}
						</div>
					</div>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-sm text-slate-500 dark:text-slate-400">
					{m.pagination_info({ currentPage, totalPages, total })}
				</p>
				<div class="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					{#each Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
						const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
						return start + i;
					}).filter((p) => p <= totalPages) as p (p)}
						<Button
							variant={p === currentPage ? 'default' : 'outline'}
							size="icon"
							class="h-8 w-8 text-xs"
							onclick={() => goToPage(p)}
						>
							{p}
						</Button>
					{/each}
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
