<script lang="ts">
	import { onMount } from 'svelte';
	import History from '@lucide/svelte/icons/history';
	import { formatDistanceToNow } from 'date-fns';
	import { id } from 'date-fns/locale';

	interface Activity {
		user?: { name?: string };
		action?: string;
		entityType?: string;
		createdAt: string | Date | null;
	}

	let { activity }: { activity: Activity } = $props();
	let timeAgo = $state('');

	onMount(() => {
		timeAgo = formatDistanceToNow(new Date(activity.createdAt || new Date()), {
			addSuffix: true,
			locale: id
		});
	});
</script>

<div class="hover:bg-muted/40 flex items-start gap-4 border-b p-4 transition-colors last:border-0">
	<div class="bg-primary/10 mt-1 rounded-full p-2">
		<History size={16} class="text-primary" />
	</div>
	<div class="flex-1 space-y-1">
		<p class="text-sm leading-none font-medium">
			<span class="text-foreground font-semibold">{activity.user?.name || 'Unknown User'}</span>
			<span class="text-muted-foreground font-normal"> {activity.action} </span>
			<span class="text-foreground font-medium">{activity.entityType || ''}</span>
		</p>
		<p class="text-muted-foreground text-xs capitalize">
			{timeAgo}
		</p>
	</div>
</div>
