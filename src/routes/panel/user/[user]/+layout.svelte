<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import AppUserProfileSidebar from '$lib/components/panel/app-user-profile-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { User } from '$lib/types';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { data, children }: { data: { user: User }; children: any } = $props();
</script>

<div class="hidden h-full flex-1 flex-col gap-8 p-8 md:flex">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<h2 class="text-primary dark:text-primary text-2xl font-semibold tracking-tight">
				User Profile: {data?.user.name}
			</h2>
			<p class="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
		</div>
		<div class="flex items-center gap-2"></div>
	</div>
	<Separator />
	<div class="flex flex-1 gap-2">
		<div class="w-48 shrink-0">
			<Sidebar.Group />
			<Sidebar.GroupContent>
				<AppUserProfileSidebar />
			</Sidebar.GroupContent>
			<Sidebar.Group />
		</div>
		<div class="border-border bg-background flex-1 rounded-lg border p-4">
			{@render children?.()}
		</div>
	</div>
</div>
