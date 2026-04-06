<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let { serviceContent, serviceItem } = $props();
</script>

<section
	id="service"
	class="bg-white px-6 py-16 font-mono text-gray-800 transition-colors dark:bg-slate-900 dark:text-gray-100"
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Title dan Deskripsi -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold tracking-wide text-blue-900 dark:text-white">
				{serviceContent.heading}
			</h2>
			<p class="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
				{serviceContent.description}
			</p>
		</div>

		<!-- Card Layanan -->
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
			{#each serviceItem as service, index (index)}
				<div
					class={`relative overflow-hidden rounded-lg border border-gray-200 p-6 transition hover:shadow-md dark:border-gray-700 dark:hover:bg-slate-800 
						${index === 0 ? 'lg:row-span-2' : ''}`}
				>
					<h3 class="mb-2 text-lg font-semibold text-blue-900 dark:text-white">{service.title}</h3>
					<p class="mb-10 text-sm text-gray-700 dark:text-gray-300">{service.description}</p>
					<img
						src={service.image}
						alt={service.title}
						class={`absolute right-4 bottom-4 opacity-80 
							${index === 0 ? 'h-48 w-48' : 'h-12 w-12'}`}
					/>
				</div>
			{:else}
				{#each [0, 1, 2, 3, 4] as index (index)}
					<div
						class={`border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative overflow-hidden hover:shadow-lg transition dark:hover:bg-slate-800 
							${index === 0 ? 'lg:row-span-2' : ''}`}
					>
						<Skeleton class="text-lg font-semibold text-blue-900 dark:text-white mb-2" />
						<Skeleton class="text-sm text-gray-700 dark:text-gray-300 mb-10" />
						<Skeleton
							class="absolute bottom-4 right-4 w-12 h-12 opacity-80 bg-gray-200 dark:bg-gray-600 rounded"
						/>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</section>
