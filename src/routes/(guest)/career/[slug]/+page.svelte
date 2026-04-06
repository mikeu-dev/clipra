<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import DOMPurify from 'isomorphic-dompurify';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
	import * as m from '$lib/paraglide/messages.js';

	registerPlugin(FilePondPluginFileValidateType);

	let { data, form } = $props();

	let isApplyDialogOpen = $state(false);
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			isApplyDialogOpen = false;
			toast.success('Lamaran berhasil dikirim! Kami akan segera menghubungi Anda.');
		} else if (form?.message) {
			toast.error(form.message);
		}
	});

	let job = $derived(data.job);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let handleProcessFile = (error: any, file: any) => {
		if (!error && file.serverId) {
			const el = document.getElementById('resume') as HTMLInputElement;
			if (el) el.value = file.serverId;
		}
	};

	let handleRemoveFile = () => {
		const el = document.getElementById('resume') as HTMLInputElement;
		if (el) el.value = '';
	};
</script>

<svelte:head>
	<title>{job ? job.title : 'Lowongan'} - Karir ERP</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans dark:bg-slate-900">
	{#if !job}
		<div class="flex h-screen items-center justify-center">
			<p class="text-muted-foreground text-lg">Lowongan tidak ditemukan.</p>
			<Button href="/career" variant="link">{m.btn_back_to_career_list()}</Button>
		</div>
	{:else}
		<!-- Decorative Header -->
		<div class="relative overflow-hidden bg-blue-900 py-16 sm:py-24">
			<div class="absolute inset-0 bg-linear-to-br from-blue-800 to-indigo-900 opacity-90"></div>
			<div
				class="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu opacity-30 blur-3xl sm:-top-112 sm:ml-16 sm:translate-x-0"
				aria-hidden="true"
			>
				<div
					class="aspect-1097/845 w-272 bg-linear-to-tr from-[#ff4694] to-[#776fff]"
					style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
				></div>
			</div>

			<div class="relative mx-auto max-w-4xl px-6 text-center sm:text-left lg:px-8">
				<div class="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
					<div>
						<div class="mb-4 flex items-center gap-2 text-blue-200">
							<span
								class="rounded-full border border-blue-700 bg-blue-800/50 px-3 py-1 text-xs font-medium"
								>{job.type}</span
							>
							<span class="flex items-center gap-1 text-xs"
								><MapPin class="h-3 w-3" /> {job.location}</span
							>
						</div>
						<h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl">{job.title}</h1>
						<p class="mt-4 max-w-2xl text-lg text-blue-100">
							Bergabunglah dengan tim kami dan bantu kami membangun masa depan teknologi.
						</p>
					</div>
					<Button
						size="lg"
						class="w-full bg-white font-semibold text-blue-900 hover:bg-blue-50 sm:w-auto"
						onclick={() => (isApplyDialogOpen = true)}
					>
						Lamar Posisi Ini
					</Button>
				</div>
			</div>
		</div>

		<main class="mx-auto -mt-8 max-w-4xl px-6 py-12 lg:px-8">
			<div
				class="rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-slate-800"
			>
				<div class="prose prose-blue dark:prose-invert max-w-none">
					<h2 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
						<Briefcase class="h-6 w-6 text-blue-600" />
						Deskripsi Pekerjaan
					</h2>
					<div class="mt-4 text-gray-600 dark:text-gray-300">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html DOMPurify.sanitize(job.description)}
					</div>

					{#if job.requirements}
						<hr class="my-8 border-gray-200 dark:border-gray-700" />
						<h2 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
							<CheckCircle class="h-6 w-6 text-blue-600" />
							Kualifikasi
						</h2>
						<div class="mt-4 text-gray-600 dark:text-gray-300">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html DOMPurify.sanitize(job.requirements)}
						</div>
					{/if}
				</div>

				<div class="mt-10 flex justify-center border-t border-gray-100 pt-10 dark:border-gray-700">
					<Button size="lg" onclick={() => (isApplyDialogOpen = true)}>Lamar Sekarang</Button>
				</div>
			</div>
			<div class="mt-8 text-center">
				<Button href="/career" variant="ghost" class="text-muted-foreground"
					>{m.btn_back_to_vacancy_list()}</Button
				>
			</div>
		</main>
	{/if}
</div>

<!-- Application Dialog -->
<Dialog.Root bind:open={isApplyDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Lamar: {job?.title}</Dialog.Title>
			<Dialog.Description>
				Silakan isi formulir di bawah ini. Pastikan Anda mengunggah CV terbaru.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/apply"
			enctype="multipart/form-data"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
		>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="grid gap-2">
						<Label for="name">Nama Lengkap <span class="text-red-500">*</span></Label>
						<Input id="name" name="name" required placeholder="Nama Anda" />
					</div>
					<div class="grid gap-2">
						<Label for="phone">Nomor Telepon <span class="text-red-500">*</span></Label>
						<Input id="phone" name="phone" required placeholder="0812..." />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="email">Email <span class="text-red-500">*</span></Label>
					<Input id="email" name="email" type="email" required placeholder="email@contoh.com" />
				</div>

				<div class="grid gap-2">
					<Label for="resume">CV / Resume (PDF, Max 5MB) <span class="text-red-500">*</span></Label>
					<div class="rounded-md border p-4">
						<FilePond
							name="resumeFile"
							server={{
								process: '/api/file/upload/public',
								revert: null
							}}
							acceptedFileTypes={['application/pdf']}
							onprocessfile={handleProcessFile}
							onremovefile={handleRemoveFile}
							labelIdle={m.label_filepond_drag_drop_cv()}
						/>
						<input type="hidden" id="resume" name="resume" required />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="coverLetter">Cover Letter (Opsional)</Label>
					<Textarea
						id="coverLetter"
						name="coverLetter"
						placeholder="Ceritakan singkat tentang diri Anda..."
						rows={4}
					/>
				</div>
			</div>

			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (isApplyDialogOpen = false)}
					>{m.btn_cancel()}</Button
				>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Mengirim...
					{:else}
						Kirim Lamaran
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
