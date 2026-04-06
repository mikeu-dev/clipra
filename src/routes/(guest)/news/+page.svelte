<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Pagination from '$lib/components/ui/pagination';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let { data } = $props();

	let searchTerm = $state($page.url.searchParams.get('search') || '');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let typingTimer: any;
	let currentLocale = $derived(getLocale());

	function handleSearch(value: string) {
		searchTerm = value;
		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (value) url.searchParams.set('search', value);
			else url.searchParams.delete('search');
			url.searchParams.set('page', '1');
			goto(url);
		}, 500);
	}

	function goToPage(p: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(p));
		goto(url);
	}
</script>

<svelte:head>
	<title>{m.news_title()}</title>
</svelte:head>

<section
	class="relative isolate overflow-hidden bg-white py-24 font-mono sm:py-32 dark:bg-slate-900"
>
	<!-- Decoration -->
	<div
		class="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
		aria-hidden="true"
	>
		<div
			class="aspect-1097/845 w-274.25 bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-blue-900 sm:text-6xl dark:text-white">
				{m.news_heading()}
			</h1>
			<p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
				{m.news_subheading()}
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-7xl">
			<div class="mb-10 flex w-full items-center justify-center gap-2">
				<div
					class="flex w-full max-w-md items-center gap-2 rounded-md border border-solid border-gray-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
				>
					<svg
						class="h-5 w-5 text-gray-400 dark:text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.65 6.15z"
						/>
					</svg>
					<input
						type="search"
						placeholder={m.news_search_placeholder()}
						value={searchTerm}
						oninput={(e) => handleSearch(e.currentTarget.value)}
						class="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-400"
					/>
				</div>
			</div>

			{#if data.news.length === 0}
				<div class="py-12 text-center">
					<p class="text-muted-foreground">{m.news_empty_state()}</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.news as item (item.id)}
						<div
							class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-500 dark:bg-slate-800 dark:ring-gray-700"
						>
							{#if item.thumbnail}
								<div class="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
									<img
										src={item.thumbnail}
										alt={item.title}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
							{/if}
							<div class="flex flex-1 flex-col p-6">
								<div class="flex items-center gap-x-4 text-xs">
									<time
										datetime={item.createdAt ? item.createdAt.toString() : ''}
										class="text-gray-500"
										>{item.createdAt
											? new Date(item.createdAt).toLocaleDateString(currentLocale, {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})
											: 'N/A'}</time
									>
									{#if item.type}
										<span
											class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
											>{item.type}</span
										>
									{/if}
								</div>
								<div class="group relative flex-1">
									<h3
										class="mt-3 text-lg leading-6 font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white"
									>
										<a href={`/news/${item.slug}`}>
											<span class="absolute inset-0"></span>
											{item.title}
										</a>
									</h3>
									<p class="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
										{item.content.replace(/<[^>]*>?/gm, '')}
									</p>
								</div>

								{#if item.tags}
									<div class="mt-4 flex flex-wrap gap-2">
										{#each Array.isArray(item.tags) ? item.tags : [] as tag (tag)}
											<span
												class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30"
												>{tag}</span
											>
										{/each}
									</div>
								{/if}
							</div>
							<div
								class="flex items-center justify-between border-t border-gray-100 px-6 py-4 pt-4 dark:border-gray-700"
							>
								<div class="flex items-center gap-2 text-sm text-gray-500">
									<Calendar class="h-4 w-4" />
									{item.createdAt
										? new Date(item.createdAt).toLocaleDateString(currentLocale)
										: 'N/A'}
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="transition-transform group-hover:translate-x-1"
									href={`/news/${item.slug}`}
								>
									{m.news_read_more()}
									<ArrowRight class="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if data.total > 9}
					<div class="mt-8 flex justify-center">
						<Pagination.Root count={data.total} perPage={9} page={data.page}>
							{#snippet children({ pages, currentPage })}
								<Pagination.Content>
									<Pagination.Item>
										<Pagination.PrevButton
											onclick={() => goToPage(data.page - 1)}
											disabled={data.page <= 1}
										/>
									</Pagination.Item>
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link
													{page}
													isActive={currentPage === page.value}
													onclick={() => goToPage(page.value)}
												>
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
									<Pagination.Item>
										<Pagination.NextButton
											onclick={() => goToPage(data.page + 1)}
											disabled={data.news.length < 9}
										/>
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</section>
