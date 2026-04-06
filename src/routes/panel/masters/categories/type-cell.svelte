<script lang="ts">
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';

	let { type = '' } = $props<{ type: string }>();

	const variants: Record<string, BadgeVariant> = {
		product: 'default',
		expense: 'destructive',
		asset: 'outline',
		other: 'secondary'
	};

	let variant = $derived(variants[type] || 'secondary');
</script>

<Badge {variant} class="capitalize">
	{type}
</Badge>
