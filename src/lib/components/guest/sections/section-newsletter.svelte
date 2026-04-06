<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	let { subscriberContent } = $props();

	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let email = $state('');

	async function handleSubmit() {
		isSubmitting = true;
		const formData = new FormData();
		formData.append('email', email);

		try {
			const res = await fetch('/api/subscription', {
				method: 'POST',
				body: formData
			});

			const result = await res.json();

			if (!res.ok) {
				const errorMessage =
					result.errors?.email || JSON.stringify(result.errors) || 'Terjadi kesalahan';
				throw new Error(errorMessage);
			}

			toast.success(m.success_subscribed());
			email = '';
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			toast.error(`${e.message}`);
		} finally {
			isSubmitting = false;
			isOpen = false;
		}
	}
</script>

<section
	id="newsletter"
	class="relative isolate overflow-hidden bg-white py-16 font-mono sm:py-24 lg:py-32 dark:bg-gray-900"
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
			<div class="max-w-xl lg:max-w-lg">
				<h2 class="text-4xl font-semibold tracking-tight text-blue-900 dark:text-white">
					{subscriberContent.heading}
				</h2>
				<p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
					{subscriberContent.description}
				</p>
				<div class="mt-6 flex max-w-md gap-x-4">
					<input
						id="email-address"
						name="email"
						type="email"
						bind:value={email}
						autocomplete="email"
						required
						class="min-w-0 flex-auto rounded-md bg-gray-100 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"
						placeholder={subscriberContent.form.email.placeholder}
					/>
					<button
						type="button"
						onclick={() => (isOpen = true)}
						class="flex-none rounded-md bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
					>
						{subscriberContent.cta.subscribe}
					</button>
				</div>
			</div>

			<dl class="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
				<div class="flex flex-col items-start">
					<div
						class="rounded-md bg-gray-100 p-2 ring-1 ring-gray-300 dark:bg-white/5 dark:ring-white/10"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-newspaper-icon lucide-newspaper"
							><path d="M15 18h-5" /><path d="M18 14h-8" /><path
								d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"
							/><rect width="8" height="4" x="10" y="6" rx="1" /></svg
						>
					</div>
					<dt class="mt-4 text-base font-semibold text-gray-900 dark:text-white">
						{subscriberContent.cta.utilize.one.label}
					</dt>
					<dd class="mt-2 text-base/7 text-gray-500 dark:text-gray-400">
						{subscriberContent.cta.utilize.one.description}
					</dd>
				</div>
				<div class="flex flex-col items-start">
					<div
						class="rounded-md bg-gray-100 p-2 ring-1 ring-gray-300 dark:bg-white/5 dark:ring-white/10"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-mail-warning-icon lucide-mail-warning"
							><path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" /><path
								d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
							/><path d="M20 14v4" /><path d="M20 22v.01" /></svg
						>
					</div>
					<dt class="mt-4 text-base font-semibold text-gray-900 dark:text-white">
						{subscriberContent.cta.utilize.two.label}
					</dt>
					<dd class="mt-2 text-base/7 text-gray-500 dark:text-gray-400">
						{subscriberContent.cta.utilize.two.description}
					</dd>
				</div>
			</dl>
		</div>
	</div>

	<!-- Latar Belakang Gradasi -->
	<div class="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
		<div
			class="aspect-1155/678 w-288.75 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
</section>
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold"
				>{subscriberContent.cta.subscribe}</Dialog.Title
			>
			<Dialog.Description>{subscriberContent.form.description}</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" onclick={() => (isOpen = false)}
				>{subscriberContent.cta.cancel}</Button
			>
			{#if isSubmitting}
				<Button disabled>
					<LoaderCircle class="animate-spin" />
					{subscriberContent.cta.loading}
				</Button>
			{:else}
				<Button type="button" onclick={handleSubmit}>{subscriberContent.cta.yes}</Button>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
