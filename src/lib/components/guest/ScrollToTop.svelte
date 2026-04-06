<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';

	let showScrollTop = $state(false);

	function handleScroll() {
		if (window.scrollY > 300) {
			showScrollTop = true;
		} else {
			showScrollTop = false;
		}
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

{#if showScrollTop}
	<button
		onclick={scrollToTop}
		transition:scale={{ duration: 200 }}
		class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
		aria-label="Scroll to top"
	>
		<ArrowUp class="h-6 w-6" />
	</button>
{/if}
