<script lang="ts">
	import SectionAbout from '$lib/components/guest/sections/section-about.svelte';
	import SectionContact from '$lib/components/guest/sections/section-contact.svelte';
	import SectionHero from '$lib/components/guest/sections/section-hero.svelte';
	import SectionNewsletter from '$lib/components/guest/sections/section-newsletter.svelte';
	import SectionService from '$lib/components/guest/sections/section-service.svelte';
	import SectionTeam from '$lib/components/guest/sections/section-team.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { About, Hero, Service, Contact, Subscriber, Team } from '$lib/assets/json/index.js';
	let initialLocale = $state(getLocale());
	let heroContent = $state(Hero.content[initialLocale]);
	let aboutContent = $state(About.content[initialLocale]);
	let serviceContent = $state(Service.content[initialLocale]);
	let contactContent = $state(Contact.content[initialLocale]);
	let subscriberContent = $state(Subscriber.content[initialLocale]);
	let teamContent = $state(Team.content[initialLocale]);
	$effect(() => {
		if (initialLocale) {
			heroContent = Hero.content[initialLocale];
			aboutContent = About.content[initialLocale];
			serviceContent = Service.content[initialLocale];
			contactContent = Contact.content[initialLocale];
			subscriberContent = Subscriber.content[initialLocale];
			teamContent = Team.content[initialLocale];
		} else {
			heroContent = Hero.content['en'];
			aboutContent = About.content['en'];
			serviceContent = Service.content['en'];
			contactContent = Contact.content['en'];
			subscriberContent = Subscriber.content['en'];
			teamContent = Team.content['en'];
		}
	});
	let { data } = $props();
	let generalSettings = $derived(data.generalSettings[initialLocale] || data.generalSettings['en']);

	// Map Services to current locale
	let serviceItem = $derived(
		data.services.map((s) => ({
			title: initialLocale === 'id' ? s.titleId : s.titleEn,
			description: initialLocale === 'id' ? s.descriptionId : s.descriptionEn,
			image: s.image
		})) as { title: string; description: string; image: string }[]
	);

	// let team = $derived(data.team); // Use config teams instead
	let clients = $derived(data.clients);
</script>

<svelte:head>
	<title>{generalSettings.app_name}</title>
	<meta name="description" content={generalSettings.about} />
	<meta name="google-adsense-account" content="ca-pub-8050506910866919" />
</svelte:head>

<!-- hero -->
<SectionHero {heroContent} />

<!-- about -->
<SectionAbout {aboutContent} {clients} />

<!-- Layanan Kami Section -->
<SectionService {serviceContent} {serviceItem} />

<!-- team -->
<SectionTeam {teamContent} teams={data.team} />

<!-- contact -->
<SectionContact {contactContent} />

<!-- newsletter -->
<SectionNewsletter {subscriberContent} />
