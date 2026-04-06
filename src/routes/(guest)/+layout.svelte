<script lang="ts">
	import '../../app.css';
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import { navigation } from '$lib/config/app';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import GuestFooter from '$lib/components/guest/footer/guest-footer.svelte';
	import GuestHeader from '$lib/components/guest/header/guest-header.svelte';
	import ScrollToTop from '$lib/components/guest/ScrollToTop.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	let isLoading = $state(false);
	let initialLocale = $state(getLocale());
	let navbarMenu = $derived(navigation[initialLocale] || navigation['en']);
	let { data, children } = $props();
	let generalSettings = $derived(data.generalSettings[initialLocale] || data.generalSettings['en']);

	onMount(() => {
		beforeNavigate(() => {
			isLoading = true;
		});

		afterNavigate(() => {
			isLoading = false;
		});
	});
</script>

<ModeWatcher />
<Toaster position="top-center" />
<ScrollToTop />
<!-- header -->
<GuestHeader data={generalSettings} {navbarMenu} />
{@render children()}
<!-- footer -->
<GuestFooter data={generalSettings} {navbarMenu} />
{#if isLoading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
		<LoaderCircle class="h-8 w-auto animate-spin text-blue-500" />
	</div>
{/if}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
