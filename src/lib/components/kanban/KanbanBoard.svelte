<script lang="ts">
	import KanbanColumn from './KanbanColumn.svelte';
	import { untrack } from 'svelte';

	interface Task {
		id: string;
		title: string;
		status: string | null;
		priority: string | null;
		deadline: string | Date | null;
		description: string | null;
		assignee: { name: string | null; username: string | null; id: string | null } | null;
	}

	let {
		tasks,
		onStatusChange
	}: { tasks: Task[]; onStatusChange: (id: string, status: string) => void } = $props();

	// Group tasks by status
	// eslint-disable-next-line svelte/prefer-writable-derived
	let columns = $state(
		untrack(() => ({
			waiting: tasks.filter((t) => t.status === 'waiting' || !t.status),
			open: tasks.filter((t) => t.status === 'open'),
			in_progress: tasks.filter((t) => t.status === 'in_progress'),
			completed: tasks.filter((t) => t.status === 'completed')
		}))
	);

	// Update columns when tasks prop changes (initial load or external update)
	$effect(() => {
		columns = {
			waiting: tasks.filter((t: Task) => t.status === 'waiting' || !t.status),
			open: tasks.filter((t: Task) => t.status === 'open'),
			in_progress: tasks.filter((t: Task) => t.status === 'in_progress'),
			completed: tasks.filter((t: Task) => t.status === 'completed')
		};
	});

	function handleColumnDrop(columnId: string, newItems: Task[]) {
		const colId = columnId as keyof typeof columns;
		columns[colId] = newItems;

		// Find items that changed status
		// In a real app, we need to detect which item was moved and trigger API
		// For now, we trust the column's new state.
		// We iterate/check if any item in this column DOES NOT have this status, then update it.

		newItems.forEach((item) => {
			if (item.status !== colId) {
				// Optimistic update
				item.status = colId;
				onStatusChange(item.id, colId);
			}
		});
	}

	const columnConfig: { id: keyof typeof columns; title: string }[] = [
		{ id: 'waiting', title: 'Waiting' },
		{ id: 'open', title: 'Open' },
		{ id: 'in_progress', title: 'In Progress' },
		{ id: 'completed', title: 'Completed' }
	];
</script>

<div class="flex h-full gap-4 overflow-x-auto p-4 pb-8">
	{#each columnConfig as col (col.id)}
		<KanbanColumn id={col.id} title={col.title} items={columns[col.id]} onDrop={handleColumnDrop} />
	{/each}
</div>
