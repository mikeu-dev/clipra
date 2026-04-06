<script lang="ts">
	import { spring } from 'svelte/motion';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Archive from '@lucide/svelte/icons/archive';
	import Pencil from '@lucide/svelte/icons/pencil';

	let {
		children,
		onDelete,
		onEdit,
		onArchive,
		threshold = 80
	}: {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		children: any;
		onDelete?: () => void;
		onEdit?: () => void;
		onArchive?: () => void;
		threshold?: number;
	} = $props();

	let startX = $state(0);
	let currentX = $state(0);
	let isDragging = $state(false);

	const coords = spring(
		{ x: 0 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	function handleTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		isDragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;

		const touchX = e.touches[0].clientX;
		const delta = touchX - startX;

		// Only allow swiping left
		if (delta < 0) {
			currentX = delta;
			coords.set({ x: Math.max(delta, -160) }); // Limit swipe distance
		}
	}

	function handleTouchEnd() {
		isDragging = false;

		// Snap logic
		if (currentX < -threshold) {
			// Stay open if crossed threshold
			coords.set({ x: -120 });
		} else {
			// Close if not crossed
			coords.set({ x: 0 });
			currentX = 0;
		}
	}

	function reset() {
		coords.set({ x: 0 });
		currentX = 0;
	}
</script>

<div class="relative w-full overflow-hidden rounded-lg">
	<!-- Background Actions -->
	<div
		class="absolute inset-0 flex flex-row-reverse items-center gap-2 bg-slate-100 px-4 dark:bg-slate-900"
	>
		{#if onDelete}
			<button
				onclick={() => {
					onDelete();
					reset();
				}}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
			>
				<Trash2 class="h-5 w-5" />
			</button>
		{/if}

		{#if onArchive}
			<button
				onclick={() => {
					onArchive();
					reset();
				}}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
			>
				<Archive class="h-5 w-5" />
			</button>
		{/if}

		{#if onEdit}
			<button
				onclick={() => {
					onEdit();
					reset();
				}}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
			>
				<Pencil class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<!-- Foreground Content -->
	<div
		class="relative bg-white dark:bg-slate-950"
		style="transform: translateX({$coords.x}px); touch-action: pan-y;"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		{@render children()}
	</div>
</div>
