<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { DestroySchema } from '$lib/schemas/news/destroy';

	let { id } = $props<{
		id: string;
		formDestroy: SuperValidated<Infer<DestroySchema>>;
	}>();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item>
				<Button href="/panel/news/{id}/edit" variant="ghost" class="w-full justify-start pl-2"
					>Edit</Button
				>
			</DropdownMenu.Item>
			<form
				method="POST"
				action="?/destroy"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							import('svelte-sonner').then(({ toast }) => {
								toast.success(m.toast_success_news_deleted());
							});
						} else if (result.type === 'failure') {
							import('svelte-sonner').then(({ toast }) => {
								toast.error('Gagal menghapus berita.');
							});
						}
					};
				}}
			>
				<input type="hidden" name="id" value={id} />
				<DropdownMenu.Item>
					<button class="text-destructive w-full pl-2 text-left">Delete</button>
				</DropdownMenu.Item>
			</form>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
