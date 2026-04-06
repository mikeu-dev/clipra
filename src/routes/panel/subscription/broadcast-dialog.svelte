<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let open = $state(false);
	let isLoading = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button>Broadcast Email</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Broadcast Email</Dialog.Title>
			<Dialog.Description>Send an email to all active subscribers.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/broadcast"
			use:enhance={() => {
				isLoading = true;
				return async ({ result }) => {
					isLoading = false;
					if (result.type === 'success') {
						toast.success('Broadcast sent successfully');
						open = false;
					} else if (result.type === 'failure') {
						const data = result.data as { error?: { message: string } };
						toast.error(data?.error?.message || 'Failed to send broadcast');
					} else {
						toast.error('An unexpected error occurred');
					}
				};
			}}
			class="grid gap-4 py-4"
		>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="subject" class="text-right">Subject</Label>
				<Input id="subject" name="subject" class="col-span-3" required />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="content" class="text-right">Content</Label>
				<Textarea id="content" name="content" class="col-span-3" required />
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={isLoading}>
					{#if isLoading}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Send
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
