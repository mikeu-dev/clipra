<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Component } from 'svelte';

	let {
		title,
		value,
		icon: Icon
	}: { title: string; value: string | number; icon: Component } = $props();
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-sm font-medium">{title}</Card.Title>
		<Icon class="text-muted-foreground h-4 w-4" />
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">{value}</div>
		<!-- <p class="text-xs text-muted-foreground">+20.1% from last month</p> -->
	</Card.Content>
</Card.Root>
