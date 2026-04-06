<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref } from '$lib/paraglide/runtime';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import CheckSquare from '@lucide/svelte/icons/check-square';
	import Receipt from '@lucide/svelte/icons/receipt';
	import UserCircle from '@lucide/svelte/icons/user-circle';

	const navItems = [
		{ href: '/panel', icon: LayoutDashboard, label: 'Home', exact: true },
		{ href: '/panel/project', icon: FolderKanban, label: 'Projects' },
		{ href: '/panel/task', icon: CheckSquare, label: 'Tasks' },
		{ href: '/panel/finance/expense', icon: Receipt, label: 'Expense' },
		{ href: '/panel/profile', icon: UserCircle, label: 'Profile' }
	];

	function isActive(href: string, exact: boolean = false) {
		const currentPath = page.url.pathname;
		if (exact) {
			return currentPath === href;
		}
		return currentPath.startsWith(href);
	}
</script>

<nav
	class="pb-safe fixed right-0 bottom-0 left-0 z-40 block border-t border-slate-200 bg-white pt-2 md:hidden dark:border-slate-800 dark:bg-slate-950"
>
	<div class="flex justify-around px-2">
		{#each navItems as item (item.href)}
			<a
				href={localizeHref(item.href)}
				class="flex flex-col items-center justify-center p-2 transition-colors duration-200 {isActive(
					item.href,
					item.exact
				)
					? 'text-blue-600 dark:text-blue-400'
					: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}"
			>
				<item.icon class="h-6 w-6" />
				<span class="mt-1 text-[10px] font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	/* Safe area padding for iPhones with notch/home indicator */
	.pb-safe {
		padding-bottom: env(safe-area-inset-bottom, 16px);
	}
</style>
