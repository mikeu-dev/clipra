<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';

	import { createColumns } from './columns';
	import DataTable from './data-table.svelte';
	import type { School } from '$lib/types';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import * as m from '$lib/paraglide/messages.js';

	let {
		data
	}: {
		data: {
			school: School[];
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();
</script>

<svelte:head>
	<title>{m.masters_schools_title()}</title>
	<meta name="description" content={m.masters_schools_desc()} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.masters_schools_title()}
			</h2>
			<p class="text-muted-foreground">
				{m.masters_roles_count({ count: data?.school.length })}
			</p>
		</div>
		<div class="flex items-center gap-2"></div>
	</div>
	<Separator />
	<DataTable data={data?.school} columns={createColumns(data?.formDestroy)} />
</div>
