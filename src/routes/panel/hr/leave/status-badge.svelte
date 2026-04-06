<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let {
		value,
		variant
	}: { value: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' } = $props();
</script>

<Badge {variant}>
	{value.toUpperCase()}
</Badge>
