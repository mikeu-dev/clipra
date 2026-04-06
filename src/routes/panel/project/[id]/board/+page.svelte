<script lang="ts">
	import KanbanBoard from '$lib/components/kanban/KanbanBoard.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	let { data } = $props();

	function handleStatusChange(taskId: string, newStatus: string) {
		// Trigger the hidden form submission
		const formData = new FormData();
		formData.append('taskId', taskId);
		formData.append('status', newStatus);

		fetch('?/updateStatus', {
			method: 'POST',
			body: formData
		}).then(async (res) => {
			if (res.ok) {
				// Optional: Invalidate load if we want strict consistency,
				// but optimistic UI in KanbanBoard handles the visual part.
			} else {
				// Revert (not implemented for simplicity)
				console.error('Failed to update status');
			}
		});
	}
</script>

<svelte:head>
	<title>{data.project.name} - Board</title>
</svelte:head>

<div class="flex h-[calc(100vh-4rem)] flex-col">
	<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
		<div class="flex items-center gap-2">
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/panel">Dashboard</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/panel/projects">Projects</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page>{data.project.name}</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
	</header>
	<div class="flex-1 overflow-hidden">
		<KanbanBoard
			tasks={// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data.tasks.map((t: any) => ({ ...t, status: t.status || 'open' }))}
			onStatusChange={handleStatusChange}
		/>
	</div>
</div>
