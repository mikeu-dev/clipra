<script lang="ts" module>
	import UserRound from '@lucide/svelte/icons/user-round';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Logs from '@lucide/svelte/icons/logs';
	import Shield from '@lucide/svelte/icons/shield';

	const projects = [
		{
			name: 'Profile',
			url: '/panel/user/[user]',
			icon: UserRound
		},
		{
			name: 'Settings',
			url: '#',
			icon: Settings2
		},
		{
			name: 'Activity',
			url: '#',
			icon: Logs
		},
		{
			name: 'Permissions',
			url: '#',
			icon: Shield
		}
	];
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let props = $props();

	let projectItems = $derived(
		projects
			.filter((item) => {
				// Hide Permissions tab if it's the user's own profile OR if not authorized by hierarchy
				if (item.name === 'Permissions') {
					if (page.data.sessionUser?.id === page.params.user) return false;

					const executorLevel = Number(page.data.sessionUser?.role?.level || '99');
					const targetLevel = Number(page.data.user?.roleLevel || '50');

					if (executorLevel >= targetLevel) return false;
				}
				return true;
			})
			.map((item) => {
				const userId = page.params.user;
				const url =
					item.name === 'Profile'
						? `/panel/user/${userId}`
						: `/panel/user/${userId}/${item.name.toLowerCase()}`;

				const isActive =
					item.name === 'Profile'
						? page.url.pathname === `/panel/user/${userId}`
						: page.url.pathname.startsWith(url);

				return {
					...item,
					url,
					isActive
				};
			})
	);
</script>

<Sidebar.Header>
	<Sidebar.Menu>
		{#each projectItems as project (project.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={project.isActive}>
					<project.icon />
					<a href={localizeHref(project.url)}><span>{project.name}</span></a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Header>
