<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	const pwk: string = '/client/LOGO-KABUPATEN-PURWAKARTA.png';
	const diskominfo: string = '/client/diskominfo-pwk.jpeg';
	import Marquee from 'svelte-fast-marquee';
	let { aboutContent, clients } = $props();
</script>

<!-- about -->
<section
	id="about"
	class="bg-white py-24 font-mono text-gray-800 transition-colors sm:py-32 dark:bg-slate-900 dark:text-gray-100"
>
	<div
		class="mx-auto grid max-w-7xl grid-cols-1 gap-10 rounded-lg border border-solid border-gray-200 px-6 py-8 lg:px-8 dark:border-gray-700"
	>
		<h2
			class="text-3xl font-semibold tracking-tight text-pretty text-blue-900 sm:text-4xl dark:text-white"
		>
			{aboutContent.heading}
		</h2>
		<p>
			{aboutContent.description}
		</p>

		<!-- Tombol ke halaman detail -->
		<div>
			<Button variant="outline" href={localizeHref(aboutContent.cta.href)}>
				{aboutContent.cta.label}
			</Button>
		</div>
		<!-- marquee wrapper -->
		<div class="relative overflow-hidden">
			<!-- Kontainer animasi berjalan -->
			<Marquee direction="right" play={true}>
				<!-- Duplikasi 2x untuk efek berjalan kontinu -->
				{#each clients as item, i (i)}
					{#if item.logo === pwk || item.logo === diskominfo}
						<!-- Jika logo adalah pwk, tampilkan teks -->
						<div class="mx-3 flex items-center gap-2">
							<img
								src={item.logo}
								alt={item.name}
								class="max-h-12 w-auto rounded-lg object-contain"
								loading="lazy"
								decoding="async"
							/>
							<span class="text-lg font-semibold text-blue-900 dark:text-gray-200">{item.name}</span
							>
						</div>
					{:else}
						<!-- Logo biasa -->
						<img
							src={item.logo}
							alt={item.name}
							class="mx-3 max-h-12 w-auto rounded-lg object-contain"
							loading="lazy"
							decoding="async"
						/>
					{/if}
				{/each}
			</Marquee>
		</div>
	</div>
</section>
