<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import MapPinHouse from '@lucide/svelte/icons/map-pin-house';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	let { data } = $props();
	import { getLocale } from '$lib/paraglide/runtime';
	import { AboutPage, CTA } from '$lib/assets/json/index.js';
	import SectionOrganization from '$lib/components/guest/sections/section-organization.svelte';

	let initialLocale = $state(getLocale());
	let generalSettings = $derived(data.generalSettings[initialLocale] || data.generalSettings['en']);
	let aboutContent = $state(AboutPage.content[initialLocale]);
	let ctaContent = $state(CTA.content[initialLocale]);
	$effect(() => {
		if (initialLocale) {
			aboutContent = AboutPage.content[initialLocale];
			ctaContent = CTA.content[initialLocale];
		} else {
			aboutContent = AboutPage.content['en'];
			ctaContent = CTA.content['en'];
		}
	});

	const projectSuccess = tweened(0, { duration: 2000, easing: cubicOut });
	const client = tweened(0, { duration: 2000, easing: cubicOut });
	const team = tweened(0, { duration: 2000, easing: cubicOut });
	const year = tweened(0, { duration: 2000, easing: cubicOut });

	onMount(() => {
		projectSuccess.set(100);
		client.set(66);
		team.set(12);
		year.set(5);
	});

	// Kosong untuk sekarang, bisa digunakan nanti jika ada interaktivitas
</script>

<div class="relative isolate overflow-hidden bg-white py-24 font-mono sm:py-32 dark:bg-slate-900">
	<!-- Dekorasi blur -->
	<div
		class="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
		aria-hidden="true"
	>
		<div
			class="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
	<div
		class="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-112 sm:ml-16 sm:translate-x-0 sm:transform-gpu"
		aria-hidden="true"
	>
		<div
			class="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:mx-0">
			<h2 class="text-5xl font-semibold tracking-tight text-blue-900 sm:text-7xl dark:text-white">
				{aboutContent.heading}
			</h2>
			<div
				class="mt-8 text-lg font-medium text-pretty text-gray-700 sm:text-xl/8 dark:text-gray-300"
			>
				<p class="mb-4">
					{aboutContent.description.first}
				</p>
				<p class="mb-4">
					{aboutContent.description.second}
				</p>
			</div>
		</div>

		<div class="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
			<div
				class="grid grid-cols-1 gap-x-8 gap-y-6 text-base/7 font-semibold text-gray-900 sm:grid-cols-2 md:flex lg:gap-x-10 dark:text-white"
			>
				<a href="#layanan">{aboutContent.services.service} <span aria-hidden="true">&rarr;</span></a
				>
				<a href="#portofolio"
					>{aboutContent.services.project} <span aria-hidden="true">&rarr;</span></a
				>
				<a href="#tentang">{aboutContent.services.about} <span aria-hidden="true">&rarr;</span></a>
				<a href="#kontak">{aboutContent.services.contact} <span aria-hidden="true">&rarr;</span></a>
			</div>

			<dl class="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
				<div class="flex flex-col-reverse gap-1">
					<dt class="text-base/7 text-gray-700 dark:text-gray-300">
						{aboutContent.goals.successfulProject}
					</dt>
					<dd class="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
						{$projectSuccess.toFixed(0)}+
					</dd>
				</div>
				<div class="flex flex-col-reverse gap-1">
					<dt class="text-base/7 text-gray-700 dark:text-gray-300">{aboutContent.goals.client}</dt>
					<dd class="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
						{$client.toFixed(0)}+
					</dd>
				</div>
				<div class="flex flex-col-reverse gap-1">
					<dt class="text-base/7 text-gray-700 dark:text-gray-300">{aboutContent.goals.team}</dt>
					<dd class="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
						{$team.toFixed(0)}+
					</dd>
				</div>
				<div class="flex flex-col-reverse gap-1">
					<dt class="text-base/7 text-gray-700 dark:text-gray-300">
						{aboutContent.goals.history.label}
					</dt>
					<dd class="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white"></dd>
				</div>
			</dl>
		</div>
	</div>
</div>

<SectionOrganization teams={data.team} />

<section class="bg-white py-16 font-mono dark:bg-slate-900">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Grid dua kolom -->
		<div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
			<!-- Kolom kiri: Visi & Misi -->
			<div class="max-w-2xl lg:max-w-4xl">
				<h3 class="mb-6 text-4xl font-bold text-blue-900 dark:text-white">
					{aboutContent.visimisi.visi} & {aboutContent.visimisi.misi}
				</h3>
				<div class="space-y-6 text-lg font-medium text-gray-700 dark:text-gray-300">
					<div>
						<h4 class="mb-2 text-2xl font-semibold text-blue-800 dark:text-blue-300">
							{aboutContent.visimisi.visi}
						</h4>
						<p class="leading-relaxed">
							Menjadi perusahaan teknologi terdepan yang memberikan solusi digital inovatif,
							terpercaya, dan berdampak positif bagi masyarakat dan dunia usaha.
						</p>
					</div>
					<div>
						<h4 class="mb-2 text-2xl font-semibold text-blue-800 dark:text-blue-300">
							{aboutContent.visimisi.misi}
						</h4>
						<ol class="ml-2 list-outside list-decimal space-y-2 pl-5">
							<li>Mengembangkan produk dan layanan berbasis teknologi terkini.</li>
							<li>
								Memberikan pelayanan terbaik kepada klien secara profesional dan berkelanjutan.
							</li>
							<li>
								Membangun kemitraan yang kuat dengan berbagai pihak untuk mendukung transformasi
								digital.
							</li>
							<li>Mendorong inovasi dan pengembangan SDM dalam dunia teknologi informasi.</li>
						</ol>
					</div>
				</div>
			</div>

			<!-- Kolom kanan: Gambar -->
			<div class="flex justify-center">
				<img
					src="/undraw_feeling-proud_tdos.svg"
					alt="Ilustrasi Visi Misi"
					class="h-[500px] w-auto max-w-full rounded-lg drop-shadow-md dark:brightness-90"
				/>
			</div>
		</div>
	</div>
</section>

<!-- Konten Tambahan -->
<section id="lokasi" class="bg-white py-16 font-mono dark:bg-slate-900">
	<div
		class="mx-auto max-w-7xl rounded-lg border border-solid border-gray-200 px-6 py-8 lg:px-8 dark:border-gray-700"
	>
		<div class="text-center">
			<h3 class="text-3xl font-bold text-blue-900 dark:text-white">{aboutContent.address.title}</h3>
			<p class="mt-4 text-lg text-gray-700 dark:text-gray-300">
				{aboutContent.address.description}
			</p>
		</div>

		<!-- Info Kontak -->
		<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
			<div class="flex flex-col justify-center">
				<p class="text-xl font-semibold text-blue-900 dark:text-white">
					{generalSettings.app_name}
				</p>

				<ol class="mt-4 list-none space-y-2">
					<li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
						<MapPinHouse class="mt-1 shrink-0" />
						<span>{generalSettings.address}</span>
					</li>
					<li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
						<Mail class="mt-1 shrink-0" />
						<span>{generalSettings.email}</span>
					</li>
					<li class="flex items-start gap-2 text-gray-700 dark:text-gray-300">
						<Phone class="mt-1 shrink-0" />
						<span>{generalSettings.phone}</span>
					</li>
				</ol>
			</div>

			<!-- Embed Map -->
			<div>
				<iframe
					title="Lokasi Kantor"
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8576747654863!2d107.45247227413305!3d-6.90517699309342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6908f5b2f98e2f%3A0xbee7684e914a03c7!2sJl.%20Rusa%20I%20No.57%2C%20Nagri%20Kidul%2C%20Purwakarta%2C%20Jawa%20Barat%2041111%2C%20Indonesia!5e0!3m2!1sid!2sid!4v1692854327762!5m2!1sid!2sid"
					width="100%"
					height="300"
					style="border:0; border-radius: 0.25rem;"
					allowfullscreen={true}
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					class="shadow dark:brightness-75 dark:contrast-90"
				></iframe>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section
	id={CTA.id}
	class="relative isolate overflow-hidden bg-white py-16 font-mono sm:py-24 lg:py-32 dark:bg-gray-900"
>
	<div class="mx-auto max-w-4xl px-6 text-center">
		<h4 class="text-3xl font-semibold text-blue-900 dark:text-white">
			{ctaContent.heading}
		</h4>
		<p class="mt-4 text-lg text-gray-700 dark:text-gray-300">
			{ctaContent.description}
		</p>
		<Button href="/#contact" class="font-semibold">{ctaContent.button}</Button>
	</div>

	<!-- Latar Belakang Gradasi -->
	<div class="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
		<div
			class="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
</section>
