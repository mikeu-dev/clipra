<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { createColumns } from './columns';
	import DataTable from './data-table.svelte';
	import type { Subscription } from '$lib/types';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	import * as m from '$lib/paraglide/messages.js';
	import BroadcastDialog from './broadcast-dialog.svelte';
	let {
		data
	}: {
		data: {
			subscription: Subscription[];
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();
</script>

<svelte:head>
	<title>{m.subscription_title()}</title>
	<meta name="description" content={m.subscription_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.subscription_title()}
			</h2>
			<p class="text-muted-foreground">
				{m.subscription_count({ count: data?.subscription.length })}
			</p>
		</div>
		<div class="flex items-center gap-2">
			<BroadcastDialog />
		</div>
	</div>
	<Separator />
	<DataTable data={data?.subscription} columns={createColumns(data?.formDestroy)} />
</div>
