<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
	let isCreating = $state(false);

	import type { ActionResult } from '@sveltejs/kit';

	function handleResult({ result }: { result: ActionResult }) {
		if (result.type === 'success') {
			toast.success(m.msg_service_processed());
			isCreating = false;
		} else if (result.type === 'failure') {
			toast.error(result.data?.error || m.msg_service_failed());
		}
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
				{m.services_management()}
			</h1>
			<p class="text-muted-foreground">{m.services_desc_manage()}</p>
		</div>
		<Button onclick={() => (isCreating = true)}>
			<Plus class="mr-2 h-4 w-4" />
			{m.btn_add_service()}
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{m.label_title()} (ID)</Table.Head>
						<Table.Head>{m.label_title()} (EN)</Table.Head>
						<Table.Head>{m.label_description()}</Table.Head>
						<Table.Head class="text-right">{m.tbl_actions()}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.services as service (service.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{service.titleId}</Table.Cell>
							<Table.Cell>{service.titleEn || '-'}</Table.Cell>
							<Table.Cell class="max-w-xs truncate">{service.descriptionId}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="icon" disabled title="Edit feature coming soon">
										<Pencil class="h-4 w-4" />
									</Button>
									<form
										method="POST"
										action="?/delete"
										use:enhance={() => handleResult}
										class="inline"
									>
										<input type="hidden" name="id" value={service.id} />
										<Button
											variant="ghost"
											size="icon"
											type="submit"
											class="text-red-500 hover:bg-red-50 hover:text-red-700"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</form>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.services.length === 0}
						<Table.Row>
							<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center"
								>{m.msg_no_services()}</Table.Cell
							>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Create/Edit Dialog -->
	<Dialog.Root bind:open={isCreating}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{m.label_add_new_service()}</Dialog.Title>
			</Dialog.Header>
			<form method="POST" action="?/create" use:enhance={() => handleResult} class="space-y-4">
				<div class="grid gap-4">
					<div class="space-y-2">
						<Label for="titleId">{m.label_title_id()}</Label>
						<Input id="titleId" name="titleId" required placeholder="Layanan A" />
					</div>
					<div class="space-y-2">
						<Label for="titleEn">{m.label_title_en()}</Label>
						<Input id="titleEn" name="titleEn" placeholder="Service A" />
					</div>
					<div class="space-y-2">
						<Label for="descriptionId">{m.label_desc_id()}</Label>
						<Textarea id="descriptionId" name="descriptionId" placeholder="Deskripsi layanan..." />
					</div>
					<div class="space-y-2">
						<Label for="descriptionEn">{m.label_desc_en()}</Label>
						<Textarea
							id="descriptionEn"
							name="descriptionEn"
							placeholder="Service description..."
						/>
					</div>
				</div>
				<div class="flex justify-end gap-2">
					<Button variant="outline" type="button" onclick={() => (isCreating = false)}
						>{m.btn_cancel()}</Button
					>
					<Button type="submit">{m.label_create_service()}</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
