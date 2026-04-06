<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	console.log('error panel', (page.error as any)?.status);
</script>

<svelte:head></svelte:head>

<div class="bg-white text-gray-800">
	<div class="flex min-h-screen flex-col">
		<!-- main -->
		<div class="flex-grow">
			<!-- content -->
			<div class="flex min-h-screen items-center justify-center px-4">
				<div class="w-full max-w-md space-y-6 text-center">
					<img class="mx-auto h-64" src="/images/gfx/error-404.svg" alt="Error 404" />
					<div>
						<h3 class="text-2xl font-bold">
							{page.status} - {page.error?.message} (panel)
						</h3>
						<p class="mt-4 text-gray-600">
							{m.error_page_not_found_desc()}
						</p>
						<a
							href="/panel"
							class="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-lg text-white transition hover:bg-blue-700"
						>
							{m.btn_back_to_home()}
						</a>
					</div>
				</div>
			</div>
			<!-- content end -->
		</div>
	</div>
</div>
