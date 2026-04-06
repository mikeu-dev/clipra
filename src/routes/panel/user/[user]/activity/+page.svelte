<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Activity Log</h3>
		<p class="text-muted-foreground text-sm">View your recent activity and actions.</p>
	</div>
	<Separator />

	<div class="space-y-4">
		{#if data.activities && data.activities.length > 0}
			<div class="relative w-full overflow-auto">
				<table class="w-full caption-bottom text-sm">
					<thead class="[&_tr]:border-b">
						<tr
							class="border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800"
						>
							<th
								class="h-12 px-4 text-left align-middle font-medium text-neutral-500 dark:text-neutral-400 [&:has([role=checkbox])]:pr-0"
								>Action</th
							>
							<th
								class="h-12 px-4 text-left align-middle font-medium text-neutral-500 dark:text-neutral-400 [&:has([role=checkbox])]:pr-0"
								>Date</th
							>
						</tr>
					</thead>
					<tbody class="[&_tr:last-child]:border-0">
						{#each data.activities as activity (activity)}
							<tr
								class="border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:hover:bg-neutral-800/50 dark:data-[state=selected]:bg-neutral-800"
							>
								<td class="p-4 align-middle">{activity.action}</td>
								<td class="p-4 align-middle">{new Date(activity.createdAt).toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-muted-foreground text-sm">No recent activity.</p>
		{/if}
	</div>
</div>
