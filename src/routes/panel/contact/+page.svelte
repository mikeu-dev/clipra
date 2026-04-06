<script lang="ts">
	import { createColumns } from './columns';
	import DataTable from './data-table.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import type { ContactMessage } from '$lib/types';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';

	let {
		data
	}: {
		data: {
			contact: ContactMessage[];
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();
</script>

<svelte:head>
	<title>{m.contact_title()}</title>
	<meta name="description" content={m.contact_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.contact_title()}
			</h2>
			<p class="text-muted-foreground">
				{m.contact_count_msg({
					count: data?.contact.length,
					title: m.contact_title().toLowerCase()
				})}
			</p>
		</div>
		<div class="flex items-center gap-2"></div>
	</div>
	<Separator />
	<DataTable data={data?.contact} columns={createColumns(data?.formDestroy)} />
</div>
