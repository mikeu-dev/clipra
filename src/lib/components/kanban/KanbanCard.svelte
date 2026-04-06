<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Calendar from '@lucide/svelte/icons/calendar';
	import User from '@lucide/svelte/icons/user';

	let { task } = $props();

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high':
				return 'destructive';
			case 'medium':
				return 'default';
			case 'low':
				return 'secondary';
			default:
				return 'outline';
		}
	}
</script>

<Card.Root
	class="bg-card mb-3 cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing"
>
	<Card.Header class="space-y-0 p-3 pb-0">
		<div class="mb-2 flex items-start justify-between">
			<Badge variant={getPriorityColor(task.priority)} class="px-1.5 py-0.5 text-[10px] uppercase"
				>{task.priority}</Badge
			>
			{#if task.deadline}
				<div class="text-muted-foreground flex items-center text-[10px]">
					<Calendar size={10} class="mr-1" />
					{new Date(task.deadline).toLocaleDateString()}
				</div>
			{/if}
		</div>
		<Card.Title class="text-sm leading-tight font-medium">{task.title}</Card.Title>
	</Card.Header>
	<Card.Content class="p-3 pt-2">
		{#if task.description}
			<p class="text-muted-foreground mb-2 line-clamp-2 text-xs">{task.description}</p>
		{/if}
		<div class="mt-2 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				{#if task.assignee}
					<div
						class="text-muted-foreground bg-secondary/50 flex items-center rounded-full px-2 py-1 text-xs"
					>
						<User size={10} class="mr-1" />
						{task.assignee.name || task.assignee.username}
					</div>
				{/if}
			</div>
			<!-- <div class="text-[10px] text-muted-foreground">#{task.id.slice(0, 4)}</div> -->
		</div>
	</Card.Content>
</Card.Root>
