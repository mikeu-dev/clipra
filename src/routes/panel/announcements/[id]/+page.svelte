<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { format } from 'date-fns';
	import { id as idLocale } from 'date-fns/locale';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Send from '@lucide/svelte/icons/send';
	import Archive from '@lucide/svelte/icons/archive';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Download from '@lucide/svelte/icons/download';
	import Users from '@lucide/svelte/icons/users';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Pencil from '@lucide/svelte/icons/pencil';

	let { data } = $props();

	let announcement = $derived(data.announcement);
	let attachments = $derived(data.attachments || []);
	let stats = $derived(data.stats || { total: 0, read: 0, unread: 0 });
	let readPercentage = $derived(stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0);

	function getStatusBadge(status: string | null) {
		switch (status) {
			case 'published':
				return {
					label: 'Terbit',
					class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
				};
			case 'archived':
				return {
					label: 'Arsip',
					class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
				};
			default:
				return {
					label: 'Draft',
					class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
				};
		}
	}
</script>

<svelte:head>
	<title>{announcement.title} — Pengumuman</title>
	<meta name="description" content={announcement.title} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-6 p-8 md:flex">
	<!-- Back + Header -->
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="icon" href="/panel/announcements" class="h-9 w-9">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
			>
				<Megaphone class="h-5 w-5" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
						{announcement.title}
					</h1>
					{#if announcement.priority === 'urgent'}
						<Badge variant="destructive" class="text-[10px]">
							<AlertTriangle class="mr-0.5 h-3 w-3" /> Urgent
						</Badge>
					{/if}
					<Badge variant="outline" class="text-[10px] {getStatusBadge(announcement.status).class}">
						{getStatusBadge(announcement.status).label}
					</Badge>
				</div>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					Oleh {announcement.creator?.name || 'Unknown'} ·
					{announcement.publishedAt
						? format(new Date(announcement.publishedAt), 'dd MMMM yyyy, HH:mm', {
								locale: idLocale
							})
						: announcement.createdAt
							? format(new Date(announcement.createdAt), 'dd MMMM yyyy, HH:mm', {
									locale: idLocale
								})
							: ''}
				</p>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-2">
			{#if announcement.status === 'draft' && data.permissions?.includes('announcements.create')}
				<Button
					variant="outline"
					size="sm"
					class="gap-1.5"
					href="/panel/announcements/{announcement.id}/edit"
				>
					<Pencil class="h-3.5 w-3.5" /> Edit Draft
				</Button>
			{/if}
			{#if announcement.status === 'draft' && data.permissions?.includes('announcements.publish')}
				<form
					action="?/publish"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success')
								toast.success(m.toast_success_announcement_published());
						};
					}}
				>
					<Button type="submit" size="sm" class="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
						<Send class="h-3.5 w-3.5" /> Publish
					</Button>
				</form>
			{/if}
			{#if announcement.status === 'published' && data.permissions?.includes('announcements.publish')}
				<form
					action="?/broadcast"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success')
								toast.success(m.toast_success_announcement_broadcasted());
						};
					}}
				>
					<Button type="submit" size="sm" class="gap-1.5 bg-blue-600 hover:bg-blue-700">
						<Send class="h-3.5 w-3.5" /> Siarkan
					</Button>
				</form>
				<form
					action="?/archive"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') toast.success('Pengumuman diarsipkan');
						};
					}}
				>
					<Button type="submit" variant="outline" size="sm" class="gap-1.5">
						<Archive class="h-3.5 w-3.5" /> Arsipkan
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<Separator />

	{#if announcement.status === 'archived'}
		<Card.Root
			class="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10"
		>
			<Card.Content class="flex items-center gap-3 p-4">
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
				>
					<Archive class="h-5 w-5" />
				</div>
				<div>
					<p class="text-sm font-semibold text-amber-900 dark:text-amber-100">
						Pengumuman Ini Telah Diarsipkan
					</p>
					<p class="text-xs text-amber-700 dark:text-amber-300/80">
						Informasi dalam pengumuman ini mungkin sudah tidak relevan atau sudah digantikan oleh
						pengumuman yang lebih baru.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="lg:col-span-2">
			<Card.Root>
				<Card.Content class="p-6">
					<div class="prose prose-sm dark:prose-invert max-w-none">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html announcement.content}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Attachments -->
			{#if attachments.length > 0}
				<Card.Root class="mt-4">
					<Card.Header class="pb-3">
						<Card.Title class="flex items-center gap-2 text-sm font-medium">
							<Paperclip class="h-4 w-4" /> Lampiran ({attachments.length})
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-2">
							{#each attachments as attachment (attachment.id)}
								<a
									href={attachment.url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
								>
									<div class="flex items-center gap-2">
										<Paperclip class="h-4 w-4 text-slate-400" />
										<span class="text-sm font-medium text-slate-700 dark:text-slate-300">
											{attachment.docName}
										</span>
										{#if attachment.size}
											<span class="text-xs text-slate-400">
												({(attachment.size / 1024).toFixed(1)} KB)
											</span>
										{/if}
									</div>
									<Download class="h-4 w-4 text-slate-400" />
								</a>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Sidebar: Stats -->
		<div class="space-y-4">
			{#if (announcement.status === 'published' || announcement.status === 'archived') && data.permissions?.includes('announcements.publish')}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="flex items-center gap-2 text-sm font-medium">
							<Users class="h-4 w-4" /> Statistik Penerima
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div class="flex items-center justify-between text-sm">
								<span class="text-slate-500">Total Penerima</span>
								<span class="font-semibold">{stats.total}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="flex items-center gap-1 text-emerald-600">
									<BookOpen class="h-3.5 w-3.5" /> Sudah Dibaca
								</span>
								<span class="font-semibold text-emerald-600">{stats.read}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="text-slate-500">Belum Dibaca</span>
								<span class="font-semibold text-amber-500">{stats.unread}</span>
							</div>

							<!-- Progress Bar -->
							<div>
								<div class="mb-1 flex justify-between text-xs text-slate-400">
									<span>Dibaca</span>
									<span>{readPercentage}%</span>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
									<div
										class="h-full rounded-full bg-emerald-500 transition-all duration-500"
										style="width: {readPercentage}%"
									></div>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="text-sm font-medium">Detail</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3 text-sm">
					{#if data.permissions?.includes('announcements.publish')}
						<div class="flex justify-between">
							<span class="text-slate-500">Target</span>
							<span class="font-medium capitalize">{announcement.targetType}</span>
						</div>
					{/if}
					<div class="flex justify-between">
						<span class="text-slate-500">Prioritas</span>
						<span class="font-medium capitalize">{announcement.priority}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Dibuat</span>
						<span class="text-xs">
							{announcement.createdAt
								? format(new Date(announcement.createdAt), 'dd MMM yyyy HH:mm', {
										locale: idLocale
									})
								: '-'}
						</span>
					</div>
					{#if announcement.publishedAt}
						<div class="flex justify-between">
							<span class="text-slate-500">Dipublish</span>
							<span class="text-xs">
								{format(new Date(announcement.publishedAt), 'dd MMM yyyy HH:mm', {
									locale: idLocale
								})}
							</span>
						</div>
					{/if}
					{#if announcement.expiresAt}
						<div class="flex justify-between">
							<span class="font-medium text-orange-600 dark:text-orange-400">Berlaku Sampai</span>
							<span class="text-xs font-medium text-orange-600 dark:text-orange-400">
								{format(new Date(announcement.expiresAt), 'dd MMM yyyy HH:mm', {
									locale: idLocale
								})}
							</span>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
