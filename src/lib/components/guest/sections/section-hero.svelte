<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	let { heroContent } = $props();
</script>

<!-- hero -->
<section id="home" class="bg-white font-mono transition-colors dark:bg-slate-900">
	<div class="relative isolate px-6 pt-14 lg:px-8">
		<!-- Atas -->
		<div
			class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
			aria-hidden="true"
		>
			<div
				class="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-pink-400 to-indigo-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
				style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
			></div>
		</div>

		<!-- Konten -->
		<div class="mx-auto max-w-4xl py-32 text-center sm:py-48 lg:py-56">
			<div class="hidden sm:mb-8 sm:flex sm:justify-center">
				<div
					class="relative rounded-lg px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-gray-100/20 dark:hover:ring-gray-100/30"
				>
					{heroContent.heading}
				</div>
			</div>
			<h1 class="text-5xl font-semibold tracking-tight text-blue-900 sm:text-7xl dark:text-white">
				{heroContent.subheading}
			</h1>
			<p class="mt-8 text-lg font-medium text-gray-600 sm:text-xl dark:text-gray-300">
				{heroContent.description}
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<a
					href={localizeHref(heroContent.cta[0].href)}
					class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 dark:hover:bg-blue-700"
				>
					{heroContent.cta[0].label}
				</a>
				<a
					href={localizeHref(heroContent.cta[1].href)}
					class="group relative inline-block text-sm font-semibold text-gray-900 dark:text-gray-100"
				>
					{heroContent.cta[1].label} <span aria-hidden="true">→</span>
					<span
						class="absolute -bottom-1 left-1/2 h-0.5 w-0 origin-center -translate-x-1/2 transform bg-sky-500 transition-all duration-300 group-hover:w-full"
					></span>
				</a>
			</div>
		</div>

		<!-- Bawah -->
		<div
			class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
			aria-hidden="true"
		>
			<div
				class="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-pink-400 to-indigo-400 opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
				style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
			></div>
		</div>
	</div>
</section>
