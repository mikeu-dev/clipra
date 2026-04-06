<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import KanbanCard from './KanbanCard.svelte';

	let { title, items, onDrop, id } = $props();

	const flipDurationMs = 200;

	function handleDndConsider(e: CustomEvent) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent) {
		items = e.detail.items;
		onDrop(id, items);
	}
</script>

<div
	class="bg-muted/30 border-border/50 flex h-full w-[280px] min-w-[280px] flex-col rounded-lg border"
>
	<div class="flex items-center justify-between p-3 text-sm font-semibold">
		<span class="tracking-wider uppercase">{title}</span>
		<span class="bg-background text-foreground rounded-full border px-2 py-0.5 text-xs font-bold"
			>{items.length}</span
		>
	</div>

	<div
		class="min-h-[100px] flex-1 overflow-y-auto p-2"
		use:dndzone={{
			items,
			flipDurationMs,
			dropTargetStyle: { outline: '2px solid hsl(var(--primary))' }
		}}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		{#each items as item (item.id)}
			<div class="animate-item">
				<KanbanCard task={item} />
			</div>
		{/each}
	</div>
</div>

<style>
	/* Smooth transitions for dnd items if needed */
	.animate-item {
		transition: transform 0.2s;
	}
</style>
