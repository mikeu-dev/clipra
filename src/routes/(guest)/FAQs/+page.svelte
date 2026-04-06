<script>
	import { CTA, FAQPage } from '$lib/assets/json/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	let { data } = $props();
	import { getLocale } from '$lib/paraglide/runtime';

	let initialLocale = $state(getLocale());
	let faqContent = $state(FAQPage.content[initialLocale]);
	let ctaContent = $state(CTA.content[initialLocale]);
	$effect(() => {
		if (initialLocale) {
			faqContent = FAQPage.content[initialLocale];
			ctaContent = CTA.content[initialLocale];
		} else {
			faqContent = FAQPage.content['en'];
			ctaContent = CTA.content['en'];
		}
	});
</script>

<svelte:head>
	<title>{faqContent.heading} - {data.generalSettings[initialLocale].app_name}</title>
</svelte:head>

<section
	class="relative isolate overflow-hidden bg-white py-24 font-mono sm:py-32 dark:bg-slate-900"
>
	<!-- Dekorasi blur -->
	<div
		class="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
		aria-hidden="true"
	>
		<div
			class="aspect-1097/845 w-274.25 bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
	<div
		class="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
		aria-hidden="true"
	>
		<div
			class="aspect-1097/845 w-274.25 bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<div class="mx-auto max-w-7xl px-6 py-16">
		<div class="grid grid-cols-1 items-start gap-12 md:grid-cols-3">
			<!-- Kiri: Judul dan Deskripsi -->
			<div class="md:col-span-1">
				<h1 class="mb-4 text-3xl font-bold text-blue-800 dark:text-blue-400">
					{faqContent.heading}
				</h1>
				<p class="leading-relaxed text-gray-600 dark:text-gray-300">
					{faqContent.description}
					{data.generalSettings[initialLocale].app_name}.
				</p>
			</div>

			<!-- Kanan: Daftar FAQs -->
			<div class="space-y-8 md:col-span-2">
				<!-- FAQ Item -->
				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Apa itu {data.generalSettings[initialLocale].app_name}?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						{data.generalSettings[initialLocale].app_name} adalah perusahaan software house yang bergerak
						di bidang pengembangan perangkat lunak seperti aplikasi web, mobile, dan sistem informasi.
					</p>
				</div>

				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Layanan apa saja yang ditawarkan?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Kami menawarkan pembuatan aplikasi kustom, website, mobile apps, integrasi sistem,
						automasi bisnis, dan konsultasi teknologi.
					</p>
				</div>

				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Bagaimana proses kerja sama proyek dilakukan?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Dimulai dari konsultasi kebutuhan, proposal, perencanaan, pengembangan, uji coba,
						implementasi, hingga dukungan pasca proyek.
					</p>
				</div>

				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Apakah melayani klien dari luar kota atau luar negeri?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Ya. Kami mendukung kerja remote dan komunikasi daring yang efisien untuk menjangkau
						klien dari mana saja.
					</p>
				</div>

				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Bisakah membuat aplikasi sesuai permintaan khusus?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Bisa. Kami mengembangkan aplikasi sesuai kebutuhan spesifik bisnis Anda.
					</p>
				</div>

				<div>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
						Bagaimana cara menghubungi {data.generalSettings[initialLocale].app_name}?
					</h2>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Hubungi kami lewat
						<a
							href="mailto:{data.generalSettings[initialLocale].email}"
							class="text-blue-600 underline dark:text-blue-400"
						>
							email
						</a>, WhatsApp, atau form kontak yang tersedia di website kami.
					</p>
				</div>
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
			class="aspect-1155/678 w-288.75 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
</section>
