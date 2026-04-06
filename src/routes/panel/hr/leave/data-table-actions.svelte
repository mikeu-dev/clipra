<script lang="ts" module>
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { IdSchema } from '$lib/schemas/destroy';

	let {
		formDestroy,
		id,
		status
	}: { formDestroy: SuperValidated<Infer<IdSchema>>; id: string; status: string | null } = $props();

	const destroyForm = superForm(
		untrack(() => formDestroy),
		{
			resetForm: true,
			id: untrack(() => `destroy-form-${id}`),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Leave request deleted successfully');
					isOpenDestroy = false;
				} else if (result.type === 'error') {
					toast.error(result.error?.message || 'Failed to delete leave request');
				}
			}
		}
	);
	const { enhance: enhanceDestroy, delayed: delayedDestroy } = destroyForm;

	let isOpenDestroy = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>

			{#if status === 'pending'}
				<DropdownMenu.Item>
					<form method="POST" action="?/approve">
						<input type="hidden" name="id" value={id} />
						<Button
							type="submit"
							size="sm"
							variant="ghost"
							class="w-full justify-start text-green-600"
						>
							<Check class="mr-2 h-4 w-4" /> Approve
						</Button>
					</form>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<form method="POST" action="?/reject">
						<input type="hidden" name="id" value={id} />
						<Button
							type="submit"
							size="sm"
							variant="ghost"
							class="w-full justify-start text-red-600"
						>
							<X class="mr-2 h-4 w-4" /> Reject
						</Button>
					</form>
				</DropdownMenu.Item>
			{/if}

			<DropdownMenu.Item>
				<Button
					onclick={() => (isOpenDestroy = true)}
					size="sm"
					variant="ghost"
					class="w-full justify-start text-red-600"
				>
					<Trash2 class="mr-2 h-4 w-4" /> Delete
				</Button>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Delete dialog -->
<Dialog.Root bind:open={isOpenDestroy}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold">Delete leave request</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this leave request? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<!-- Form delete -->
		<form method="POST" action="?/destroy" use:enhanceDestroy>
			<input type="hidden" name="id" value={id} />

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (isOpenDestroy = false)}>
					Cancel
				</Button>
				{#if $delayedDestroy}
					<Button disabled variant="destructive">
						<LoaderCircle class="animate-spin" />
						Please wait
					</Button>
				{:else}
					<Button type="submit" variant="destructive">Delete</Button>
				{/if}
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
