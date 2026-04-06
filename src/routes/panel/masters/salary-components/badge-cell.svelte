<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { value }: { value: string } = $props();
</script>

<Badge variant={value === 'allowance' ? 'default' : 'destructive'}>
	{value.toUpperCase()}
</Badge>
