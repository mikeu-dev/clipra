<script lang="ts">
	import { analyticsStore, type DateRangePreset } from '$lib/stores/analytics.svelte';
	import * as Select from '$lib/components/ui/select';
	import { format } from 'date-fns';

	// Initial sync with store
	$effect(() => {
		// Simple one-way sync logic or specialized handling can be added here
		// For now relying on simple preset selection
	});

	const presets = [
		{ label: 'Today', value: 'today' },
		{ label: 'Last 7 Days', value: 'last-7-days' },
		{ label: 'Last 30 Days', value: 'last-30-days' },
		{ label: 'This Month', value: 'this-month' }
	];

	function handlePresetChange(value: string) {
		analyticsStore.setRange(value as DateRangePreset);
	}
</script>

<div class="flex items-center gap-2">
	<Select.Root
		value={analyticsStore.range.preset}
		onValueChange={(v) => handlePresetChange(v as string)}
		type="single"
	>
		<Select.Trigger class="w-[180px]">
			{presets.find((p) => p.value === analyticsStore.range.preset)?.label || 'Select period'}
		</Select.Trigger>
		<Select.Content>
			{#each presets as preset (preset.value)}
				<Select.Item value={preset.value}>{preset.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<!-- Custom date picker could go here if 'custom' is selected -->
	<div class="text-muted-foreground text-sm">
		{format(analyticsStore.range.start, 'MMM dd, yyyy')} - {format(
			analyticsStore.range.end,
			'MMM dd, yyyy'
		)}
	</div>
</div>
