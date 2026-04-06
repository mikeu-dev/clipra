<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let isLoading = $state(false);
</script>

<div class="w-full max-w-md">
	<form
		method="POST"
		action="/api/newsletter/subscribe"
		use:enhance={() => {
			isLoading = true;
			return async ({ result }) => {
				isLoading = false;
				if (result.type === 'success') {
					toast.success('Successfully subscribed to newsletter!');
				} else if (result.type === 'failure') {
					toast.error((result.data?.message as string) || 'Failed to subscribe');
				} else {
					toast.error('An unexpected error occurred');
				}
			};
		}}
		class="flex gap-2"
	>
		<Input
			type="email"
			name="email"
			placeholder="Enter your email"
			required
			class="bg-white/5 text-white placeholder:text-gray-400 focus:bg-white/10"
		/>
		<Button type="submit" disabled={isLoading} variant="secondary">
			{#if isLoading}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Subscribe
		</Button>
	</form>
</div>
