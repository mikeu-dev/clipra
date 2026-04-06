<script lang="ts">
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { isReplied } = $props();
</script>

<div class="flex w-[120px] items-center">
	{#if isReplied}
		<Badge variant="outline"><CheckCircle class="size-4 text-green-500" />Replied</Badge>
	{:else}
		<Badge variant="outline"><CircleDot class="size-4 text-yellow-500" />Unreplied</Badge>
	{/if}
</div>
