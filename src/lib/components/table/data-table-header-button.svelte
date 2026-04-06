<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = ComponentProps<typeof Button> & {
		label: string;
	};
	let { label, variant = 'ghost', ...restProps }: Props = $props();
</script>

<Button {variant} {...restProps}>
	{label}
	<ArrowUpDown class="ml-2" />
</Button>
