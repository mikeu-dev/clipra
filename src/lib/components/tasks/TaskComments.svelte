<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { realtime } from '$lib/stores/realtime.svelte';
	import { onMount, untrack } from 'svelte';

	// Props using runes
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let { taskId, initialComments = [] }: { taskId: string; initialComments?: any[] } = $props();

	let comments = $state(untrack(() => initialComments));
	let newComment = $state('');
	let isSubmitting = $state(false);

	onMount(() => {
		// Real-time listener for new comments on this task
		const unsub = realtime.on('comment', (data) => {
			if (data.taskId === taskId) {
				comments = [...comments, data];
			}
		});
		return unsub;
	});

	async function handleSubmit() {
		if (!newComment.trim()) return;
		isSubmitting = true;

		try {
			const res = await fetch(`/api/tasks/${taskId}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: newComment })
			});

			if (res.ok) {
				const comment = await res.json();
				// Optimistic update or wait for SSE?
				// If we wait for SSE, we might have delay.
				// Let's add it immediately if it returns the full object
				if (!comments.find((c) => c.id === comment.id)) {
					comments = [...comments, comment];
				}
				newComment = '';
			}
		} catch (error) {
			console.error('Failed to post comment', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold">Comments</h3>

	<div class="max-h-[400px] space-y-4 overflow-y-auto">
		{#if comments.length === 0}
			<div class="text-muted-foreground py-4 text-center">
				No comments yet. Start the conversation!
			</div>
		{/if}

		{#each comments as comment (comment.id)}
			<div class="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
				<div
					class="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
				>
					{comment.user?.name?.charAt(0) || 'U'}
				</div>
				<div class="flex-1 space-y-1">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">{comment.user?.name || 'Unknown User'}</span>
						<span class="text-muted-foreground text-xs"
							>{new Date(comment.createdAt).toLocaleString()}</span
						>
					</div>
					<p class="text-foreground text-sm">{comment.content}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<Textarea placeholder="Write a comment..." bind:value={newComment} class="min-h-[80px]" />
	</div>
	<div class="flex justify-end">
		<Button onclick={handleSubmit} disabled={isSubmitting}>
			{isSubmitting ? 'Posting...' : 'Post Comment'}
		</Button>
	</div>
</div>
