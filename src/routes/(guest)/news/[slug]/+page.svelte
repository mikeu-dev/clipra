<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import DOMPurify from 'isomorphic-dompurify';

	let { data } = $props();
	let currentLocale = $derived(getLocale());
</script>

<svelte:head>
	<title>{data.news.title} - {data.generalSettings[currentLocale].app_name}</title>
</svelte:head>

<article class="bg-white py-24 font-mono sm:py-32 dark:bg-slate-900">
	<div class="mx-auto max-w-3xl px-6 lg:px-8">
		<div class="mb-10">
			<Button variant="ghost" href="/news" class="pl-0 transition-all hover:pl-2">
				<ArrowLeft class="mr-2 h-4 w-4" />
				{m.news_back_button()}
			</Button>
		</div>

		<div class="mx-auto max-w-2xl text-center">
			<h1 class="text-3xl font-bold tracking-tight text-blue-900 sm:text-5xl dark:text-white">
				{data.news.title}
			</h1>
			<div
				class="mt-6 flex items-center justify-center gap-x-4 text-xs leading-5 text-gray-500 dark:text-gray-400"
			>
				<div class="flex items-center gap-2">
					<Calendar class="h-4 w-4" />
					<time datetime={data.news.createdAt ? data.news.createdAt.toString() : ''}>
						{data.news.createdAt
							? new Date(data.news.createdAt).toLocaleDateString(currentLocale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})
							: ''}
					</time>
				</div>
				{#if data.news.type}
					<div class="flex items-center gap-2">
						<span class="h-1 w-1 rounded-full bg-gray-500"></span>
						<span>{data.news.type}</span>
					</div>
				{/if}
			</div>
		</div>

		{#if data.news.thumbnail}
			<div class="mt-8 aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
				<img src={data.news.thumbnail} alt={data.news.title} class="h-full w-full object-cover" />
			</div>
		{/if}

		<div
			class="prose prose-lg prose-blue dark:prose-invert mt-10 max-w-none text-gray-600 dark:text-gray-300"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html DOMPurify.sanitize(data.news.content)}
		</div>

		{#if data.news.tags && Array.isArray(data.news.tags)}
			<div class="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
				{#each data.news.tags as tag (tag)}
					<span
						class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
						>#{tag}</span
					>
				{/each}
			</div>
		{/if}
	</div>
</article>
