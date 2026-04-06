<script lang="ts">
	import { spring } from 'svelte/motion';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	let { onRefresh, children }: { onRefresh: () => Promise<void>; children: any } = $props();

	let startY = $state(0);
	let currentY = $state(0);
	let isDragging = $state(false);
	let isRefreshing = $state(false);

	const pullY = spring(0, {
		stiffness: 0.2,
		damping: 0.4
	});

	const THRESHOLD = 80;

	function handleTouchStart(e: TouchEvent) {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		if (scrollTop === 0) {
			startY = e.touches[0].clientY;
			isDragging = true;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging || isRefreshing) return;

		const touchY = e.touches[0].clientY;
		const delta = touchY - startY;

		if (delta > 0) {
			// Resistance effect
			currentY = Math.min(delta * 0.5, THRESHOLD * 1.5);
			pullY.set(currentY);

			// Prevent default scroll if pulling down
			if (delta > 5) {
				// e.preventDefault(); // Warning: non-passive event listener issue, keeping commented might be better for now or use action
			}
		}
	}

	async function handleTouchEnd() {
		if (!isDragging || isRefreshing) {
			isDragging = false;
			return;
		}

		isDragging = false;

		if (currentY >= THRESHOLD) {
			isRefreshing = true;
			pullY.set(THRESHOLD);

			try {
				await onRefresh();
			} finally {
				isRefreshing = false;
				pullY.set(0);
				currentY = 0;
			}
		} else {
			pullY.set(0);
			currentY = 0;
		}
	}
</script>

<div
	class="relative min-h-screen"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Refresh Indicator -->
	<div
		class="absolute top-0 right-0 left-0 flex justify-center overflow-hidden"
		style="height: {$pullY}px;"
	>
		<div class="flex items-center justify-center p-4">
			{#if isRefreshing}
				<LoaderCircle class="h-6 w-6 animate-spin text-blue-600" />
			{:else}
				<ArrowDown
					class="h-6 w-6 text-slate-500 transition-transform duration-200"
					style="transform: rotate({Math.min((currentY / THRESHOLD) * 180, 180)}deg);"
				/>
			{/if}
		</div>
	</div>

	<!-- Content -->
	<div style="transform: translateY({$pullY}px);">
		{@render children()}
	</div>
</div>
