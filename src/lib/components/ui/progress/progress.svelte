<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		value = 0,
		max = 1000,
		class: className,
		...rest
	}: { value?: number; max?: number; class?: string; [key: string]: any } = $props(); // eslint-disable-line @typescript-eslint/no-explicit-any

	let percentage = $derived((value / max) * 100);
</script>

<div
	class={cn('bg-secondary relative h-4 w-full overflow-hidden rounded-full', className)}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	{...rest}
>
	<div
		class="bg-primary h-full w-full flex-1 transition-all"
		style={`transform: translateX(-${100 - (percentage || 0)}%)`}
	></div>
</div>
