<script lang="ts">
	import * as FormPrimitive from 'formsnap';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef, WithoutChildren } from '$lib/utils.js';

	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		children: childSnippet,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		children: Snippet<[{ attrs: Record<string, any>; props: Record<string, any> }]>;
	} = $props();
	// Sanitize props to ensure compatibility
	const { id, ...rest } = $derived(restProps);
	const safeProps = $derived({ ...rest, id: id ?? undefined });
</script>

<FormPrimitive.Control {...safeProps}>
	{#snippet children({ props })}
		{@render childSnippet?.({ attrs: props, props })}
	{/snippet}
</FormPrimitive.Control>
