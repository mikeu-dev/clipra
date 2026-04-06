<script lang="ts">
	let { depth = 0, name = '' } = $props<{ depth: number; name: string }>();
</script>

<div style="padding-left: {depth * 20}px" class="flex items-center gap-2">
	{#if depth > 0}
		<span class="text-muted-foreground">↳</span>
	{/if}
	<span>{name}</span>
</div>
