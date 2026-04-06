<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Plus from '@lucide/svelte/icons/plus';

	type CompanySnippet = { id: string; name: string; logo?: string | null };

	let { companies, activeCompany } = $props<{
		companies: CompanySnippet[];
		activeCompany: CompanySnippet | null;
	}>();

	async function switchCompany(companyId: string) {
		document.cookie = `active_company_id=${companyId}; path=/; max-age=31536000`; // 1 year
		// Reload page to apply new context
		window.location.reload();
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm outline-none focus-visible:ring-2"
			>
				<div
					class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg"
				>
					{#if activeCompany?.logo}
						<img
							src={activeCompany.logo}
							alt={activeCompany.name}
							class="h-full w-full object-cover"
						/>
					{:else if activeCompany}
						<span class="font-bold">{activeCompany.name.substring(0, 2).toUpperCase()}</span>
					{:else}
						<span class="font-bold">?</span>
					{/if}
				</div>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-semibold">{activeCompany?.name || 'Select Company'}</span>
					<span class="truncate text-xs">Enterprise</span>
				</div>
				<ChevronsUpDown class="ml-auto size-4" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-muted-foreground text-xs">Companies</DropdownMenu.Label>
				{#each companies as company (company.id)}
					<DropdownMenu.Item
						onclick={() => switchCompany(company.id)}
						class="cursor-pointer gap-2 p-2"
					>
						<div class="flex size-6 items-center justify-center overflow-hidden rounded-sm border">
							{#if company.logo}
								<img src={company.logo} alt={company.name} class="h-full w-full object-cover" />
							{:else}
								{company.name.substring(0, 1).toUpperCase()}
							{/if}
						</div>
						{company.name}
						{#if activeCompany?.id === company.id}
							<span class="text-muted-foreground ml-auto text-xs">Active</span>
						{/if}
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="gap-2 p-2">
					<div class="bg-background flex size-6 items-center justify-center rounded-md border">
						<Plus class="size-4" />
					</div>
					<div class="text-muted-foreground font-medium">Add company</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
