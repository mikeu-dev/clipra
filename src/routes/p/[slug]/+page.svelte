<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import type { PageData } from './$types';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	let { data }: { data: PageData } = $props();

	// Derived values for clarity
	let company = $derived(data.company);
	let services = $derived(data.services);
	let projects = $derived(data.projects);
	let clients = $derived(data.clients);
</script>

<svelte:head>
	<title>{company.name}</title>
	<meta name="description" content={`Welcome to ${company.name}`} />
</svelte:head>

<!-- Hero Section -->
<section
	id="home"
	class="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-slate-900"
>
	<div
		class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),theme(colors.slate.900))]"
	></div>
	<div
		class="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl ring-1 shadow-indigo-600/10 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center dark:bg-slate-900 dark:shadow-indigo-900/10 dark:ring-slate-800"
	></div>

	<div class="mx-auto max-w-2xl text-center">
		<h1
			class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white"
			in:scale={{ duration: 1000, easing: elasticOut, start: 0.8 }}
		>
			{company.name}
		</h1>
		<p
			class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300"
			in:fade={{ delay: 300, duration: 800 }}
		>
			<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
			{(company.themeConfig as any)?.description || 'Your partner in excellence and innovation.'}
		</p>
		<div class="mt-10 flex items-center justify-center gap-x-6">
			<a
				href="#contact"
				class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				Get started
			</a>
			<a href="#about" class="text-sm leading-6 font-semibold text-gray-900 dark:text-white">
				Learn more <span aria-hidden="true">→</span>
			</a>
		</div>
	</div>
</section>

<!-- About Section (Placeholder for now, using company details) -->
<section id="about" class="bg-gray-50 py-24 sm:py-32 dark:bg-slate-800">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base leading-7 font-semibold text-indigo-600">About Us</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
				Driven by Passion and Quality
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
				{company.name} is dedicated to providing top-tier solutions.
				<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
				{(company.themeConfig as any)?.about ||
					'We are a team of professionals committed to delivering value to our clients.'}
			</p>
		</div>
	</div>
</section>

<!-- Services Section -->
{#if services.length > 0}
	<section id="services" class="bg-white py-24 sm:py-32 dark:bg-slate-900">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
					Our Services
				</h2>
				<p class="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
					What we offer to help your business grow.
				</p>
			</div>
			<div
				class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3"
			>
				{#each services as service (service.id)}
					<div class="flex flex-col items-start">
						<div class="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
							<!-- Icon placeholder or use service.icon if available -->
							<div class="h-6 w-6 text-indigo-600">
								<Sparkles class="size-6" />
							</div>
						</div>
						<dt class="mt-4 font-semibold text-gray-900 dark:text-white">{service.titleEn}</dt>
						<dd class="mt-2 leading-7 text-gray-600 dark:text-gray-400">
							{service.descriptionEn || 'No description available.'}
						</dd>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Portfolio Section -->
{#if projects.length > 0}
	<section id="portfolio" class="bg-gray-50 py-24 sm:py-32 dark:bg-slate-800">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
					Our Portfolio
				</h2>
				<p class="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
					Recent projects we are proud of.
				</p>
			</div>
			<div
				class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
			>
				{#each projects as project (project.id)}
					<article class="flex flex-col items-start justify-between">
						<div class="relative w-full">
							<img
								src={project.thumbnail ||
									'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80'}
								alt=""
								class="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
							/>
							<div class="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 ring-inset"></div>
						</div>
						<div class="max-w-xl">
							<div class="group relative">
								<h3
									class="mt-3 text-lg leading-6 font-semibold text-gray-900 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300"
								>
									<span class="absolute inset-0"></span>
									{project.name}
								</h3>
								<p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
									{project.description}
								</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Client Section -->
{#if clients.length > 0}
	<section class="bg-white py-24 sm:py-32 dark:bg-slate-900">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<h2 class="text-center text-lg leading-8 font-semibold text-gray-900 dark:text-white">
				Trusted by the best companies
			</h2>
			<div
				class="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5"
			>
				{#each clients as client (client.id)}
					<div
						class="col-span-2 max-h-12 w-full object-contain text-center font-bold text-gray-400 lg:col-span-1"
					>
						{client.name}
						<!-- Replace with client logo if available -->
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Contact Section (Simple footer link placeholder for now) -->
<div id="contact"></div>
