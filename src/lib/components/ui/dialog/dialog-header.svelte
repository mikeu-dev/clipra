<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-header"
	class={cn(
		'bg-muted/40 -mx-6 -mt-6 mb-4 flex flex-col gap-2 border-b px-6 py-4 text-center sm:text-left',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
