<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { createColumns } from './columns';
	import DataTable from './data-table.svelte';
	import type { Log } from '$lib/types';
	import type { IdSchema } from '$lib/schemas/destroy';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';

	let {
		data
	}: {
		data: {
			log: Log[];
			formDestroy: SuperValidated<Infer<IdSchema>>;
		};
	} = $props();

	const pages = {
		title: 'Log Activity',
		excerpt: 'View and manage activity logs of users in the system.'
	};
</script>

<svelte:head>
	<title>{pages.title}</title>
	<meta name="description" content={pages.excerpt} />
</svelte:head>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{pages.title}
			</h2>
			<p class="text-muted-foreground">
				You have {data?.log.length}
				{pages.title.toLocaleLowerCase()}
			</p>
		</div>
		<div class="flex items-center gap-2"></div>
	</div>
	<Separator />
	<DataTable data={data?.log} columns={createColumns(data?.formDestroy)} />
</div>
