<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import DataTable from './data-table.svelte';
	import { createColumns } from './columns';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.news_management()}
			</h2>
			<p class="text-muted-foreground">{m.news_desc_manage()}</p>
		</div>
		<div class="flex items-center gap-2">
			<Button href="/panel/news/create" size="sm" variant="outline"
				><Plus class="mr-2 size-4" /> {m.btn_add_news()}</Button
			>
		</div>
	</div>
	<Separator />
	<DataTable
		data={data.news}
		count={data.count}
		page={data.page}
		columns={createColumns(data.formDestroy)}
	/>
</div>
