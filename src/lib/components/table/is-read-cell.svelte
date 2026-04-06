<script lang="ts">
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { isRead } = $props();
</script>

<div class="flex w-[120px] items-center">
	{#if isRead}
		<Badge variant="outline"><CheckCircle class="size-4 text-green-500" />Read</Badge>
	{:else}
		<Badge variant="outline"><CircleDot class="size-4 text-yellow-500" />Unread</Badge>
	{/if}
</div>
