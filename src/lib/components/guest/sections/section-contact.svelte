<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import type { ContactFormData } from '$lib/types';
	import { Switch } from '$lib/components/ui/switch';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	let { contactContent } = $props();

	let isOpen = $state(false);
	let isSubmitting = $state(false);

	let data: ContactFormData = $state({
		firstName: '',
		lastName: '',
		company: '',
		email: '',
		phoneNumber: '',
		message: '',
		agreedPolicy: false
	});

	async function handleSubmit() {
		isSubmitting = true;
		const formData = new FormData();
		formData.append('firstName', data.firstName);
		formData.append('lastName', data.lastName);
		formData.append('company', data.company);
		formData.append('email', data.email);
		formData.append('phoneNumber', data.phoneNumber);
		formData.append('message', data.message);
		formData.append('agreedPolicy', data.agreedPolicy.toString());

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				body: formData
			});

			const result = await res.json();

			if (!res.ok) {
				const errorMessage =
					result.errors?.message || JSON.stringify(result.errors) || 'Terjadi kesalahan';
				throw new Error(errorMessage);
			}

			toast.success(m.success_message_sent());
			data = {
				firstName: '',
				lastName: '',
				company: '',
				email: '',
				phoneNumber: '',
				message: '',
				agreedPolicy: false
			};
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
	id="contact"
	class="relative isolate bg-white px-6 py-24 font-mono sm:py-32 lg:px-8 dark:bg-gray-900"
>
	<div class="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
		<img src="./undraw_global-team_8jok.svg" alt="bg" class="w-[80%] opacity-80" />
	</div>

	<!-- Background Gradient -->
	<div
		class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
		aria-hidden="true"
	>
		<div
			class="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-288.75"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<!-- Heading -->
	<div class="mx-auto max-w-2xl text-center">
		<h2
			class="text-4xl font-semibold tracking-tight text-balance text-blue-900 sm:text-5xl dark:text-white"
		>
			{contactContent.heading}
		</h2>
		<p class="mt-2 text-lg/8 text-gray-600 dark:text-gray-300">
			{contactContent.description}
		</p>
	</div>

	<!-- Form -->
	<div class="relative z-10 mx-auto mt-16 max-w-xl sm:mt-20">
		<div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
			<!-- Input Fields -->
			<!-- Nama Depan -->
			<div>
				<label
					for="firstName"
					class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
				>
					{contactContent.form.firstName.label}
				</label>
				<div class="mt-2.5">
					<input
						type="text"
						name="firstName"
						id="firstName"
						autocomplete="given-name"
						placeholder={contactContent.form.firstName.placeholder}
						bind:value={data.firstName}
						class="block w-full rounded-md bg-white/30 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-gray-800/30 dark:text-white dark:outline-gray-600 dark:placeholder:text-gray-500"
					/>
				</div>
			</div>

			<!-- Nama Belakang -->
			<div>
				<label
					for="lastName"
					class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
				>
					{contactContent.form.lastName.label}
				</label>
				<div class="mt-2.5">
					<input
						type="text"
						name="lastName"
						id="lastName"
						autocomplete="family-name"
						placeholder={contactContent.form.lastName.placeholder}
						bind:value={data.lastName}
						class="block w-full rounded-md bg-white/30 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-gray-800/30 dark:text-white dark:outline-gray-600 dark:placeholder:text-gray-500"
					/>
				</div>
			</div>

			<!-- Company -->
			<div class="sm:col-span-2">
				<label for="company" class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
					>{contactContent.form.company.label}</label
				>
				<div class="mt-2.5">
					<input
						type="text"
						name="company"
						id="company"
						autocomplete="organization"
						bind:value={data.company}
						placeholder={contactContent.form.company.placeholder}
						class="block w-full rounded-md bg-white/30 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-gray-800/30 dark:text-white dark:outline-gray-600 dark:placeholder:text-gray-500"
					/>
				</div>
			</div>

			<!-- Email -->
			<div class="sm:col-span-2">
				<label for="email" class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
					>{contactContent.form.email.label}</label
				>
				<div class="mt-2.5">
					<input
						type="email"
						name="email"
						id="email"
						autocomplete="email"
						bind:value={data.email}
						placeholder={contactContent.form.email.placeholder}
						class="block w-full rounded-md bg-white/30 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-gray-800/30 dark:text-white dark:outline-gray-600 dark:placeholder:text-gray-500"
					/>
				</div>
			</div>

			<!-- Phone -->
			<div class="sm:col-span-2">
				<label
					for="phoneNumber"
					class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
					>{contactContent.form.phone.label}</label
				>
				<div class="mt-2.5">
					<div
						class="flex rounded-md bg-white/30 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-blue-600 dark:bg-gray-800/30 dark:outline-gray-600"
					>
						<div class="grid shrink-0 grid-cols-1 focus-within:relative">
							<select
								id="country"
								name="country"
								autocomplete="country"
								aria-label="Negara"
								class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-transparent py-2 pr-7 pl-3.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 dark:bg-transparent dark:text-gray-300 dark:placeholder:text-gray-500"
							>
								<option>ID</option>
							</select>
							<svg
								class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
								viewBox="0 0 16 16"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<input
							type="text"
							name="phoneNumber"
							id="phoneNumber"
							bind:value={data.phoneNumber}
							placeholder={contactContent.form.phone.placeholder}
							class="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-transparent dark:text-white dark:placeholder:text-gray-500"
						/>
					</div>
				</div>
			</div>

			<!-- Message -->
			<div class="sm:col-span-2">
				<label for="message" class="block text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
					>{contactContent.form.message.label}</label
				>
				<div class="mt-2.5">
					<textarea
						name="message"
						id="message"
						rows="4"
						bind:value={data.message}
						placeholder={contactContent.form.message.placeholder}
						class="block w-full rounded-md bg-white/30 px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 backdrop-blur-sm placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:bg-gray-800/30 dark:text-white dark:outline-gray-600 dark:placeholder:text-gray-500"
					></textarea>
				</div>
			</div>

			<!-- Policy Toggle -->
			<div class="flex gap-x-4 sm:col-span-2">
				<div class="flex items-center space-x-2">
					<Switch id="agreedPolicy" bind:checked={data.agreedPolicy} />
					<Label for="agreedPolicy">{contactContent.form.policy}</Label>
				</div>
			</div>
		</div>

		<!-- Tombol Kirim -->
		<div class="mt-10">
			<button
				type="button"
				onclick={() => (isOpen = true)}
				class="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				{contactContent.cta.submit}
			</button>
		</div>
	</div>
</section>
<Dialog.Root bind:open={isOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-primary font-semibold"
				>{contactContent.cta.confirmTitle}</Dialog.Title
			>
			<Dialog.Description>{contactContent.cta.confirmMessage}</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-2">
			<Button type="button" variant="outline" onclick={() => (isOpen = false)}
				>{contactContent.cta.cancel}</Button
			>
			{#if isSubmitting}
				<Button disabled>
					<LoaderCircle class="animate-spin" />
					{contactContent.cta.loading}
				</Button>
			{:else}
				<Button type="button" onclick={handleSubmit}>{contactContent.cta.yes}</Button>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
