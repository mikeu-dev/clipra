<script lang="ts">
	import '../../../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import GuestFooter from '$lib/components/guest/footer/guest-footer.svelte';
	import GuestHeader from '$lib/components/guest/header/guest-header.svelte';
	import ScrollToTop from '$lib/components/guest/ScrollToTop.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let isLoading = $state(false);

	// Props from +layout.server.ts
	let { data, children } = $props();

	// We use data directly as it's already prepared for this company
	let generalSettings = $derived(data.generalSettings);
	let navbarMenu = $derived(data.navbarMenu);

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

<main class="min-h-screen pt-20">
	<!-- Added pt-20 to account for fixed header -->
	{@render children()}
</main>

<!-- footer -->
<GuestFooter data={generalSettings} {navbarMenu} />

{#if isLoading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
		<LoaderCircle class="h-8 w-auto animate-spin text-blue-500" />
	</div>
{/if}
