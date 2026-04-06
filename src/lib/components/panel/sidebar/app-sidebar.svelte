<script lang="ts" module>
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import Users from '@lucide/svelte/icons/users';
	import Contact from '@lucide/svelte/icons/contact';
	import MailCheck from '@lucide/svelte/icons/mail-check';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Shield from '@lucide/svelte/icons/shield';
	import Bell from '@lucide/svelte/icons/bell';
	import BookUser from '@lucide/svelte/icons/book-user';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import Receipt from '@lucide/svelte/icons/receipt';
	import Landmark from '@lucide/svelte/icons/landmark';
	import Clock from '@lucide/svelte/icons/clock';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ChartBar from '@lucide/svelte/icons/chart-bar';
	import Church from '@lucide/svelte/icons/church';
	import ChartPie from '@lucide/svelte/icons/chart-pie';
	import Database from '@lucide/svelte/icons/database';
	import Logs from '@lucide/svelte/icons/logs';
	import Tag from '@lucide/svelte/icons/tag';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Handshake from '@lucide/svelte/icons/handshake';
	import Package from '@lucide/svelte/icons/package';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import CalendarCheck from '@lucide/svelte/icons/calendar-check';
	import Wallet from '@lucide/svelte/icons/wallet';
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Building from '@lucide/svelte/icons/building';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Map from '@lucide/svelte/icons/map';

	export type MenuItem = {
		title: string;
		url: string;
		icon: typeof LayoutGrid;
		exact?: boolean;
		groups: string[];
		permissions?: string[];
	};

	export const MODULES = [
		{ id: 'all', name: 'All Apps', icon: LayoutGrid },
		{ id: 'hr', name: 'HR & Management', icon: Users },
		{ id: 'finance', name: 'Finance', icon: CircleDollarSign },
		{ id: 'engineering', name: 'Engineering', icon: Briefcase },
		{ id: 'marketing', name: 'Marketing', icon: Megaphone }
	];
</script>

<script lang="ts">
	import CompanySwitcher from './company-switcher.svelte';
	import TeamSwitcher from './team/team-switcher.svelte';
	import NavMain from '../navigations/nav-main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import NavUser from '../navigations/nav-user.svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	type CompanySnippet = { id: string; name: string; logo?: string | null };

	type Props = ComponentProps<typeof Sidebar.Root> & {
		data: {
			user: { name: string; email: string; avatar: string; id: string };
			projects: unknown[];
			availableCompanies: CompanySnippet[];
			activeCompany: CompanySnippet | null;
			permissions?: string[];
		};
	};

	let { data, ref = $bindable(null), collapsible = 'icon', ...restProps }: Props = $props();

	let initialLocale = $state(getLocale());
	let activeModule = $state('all');

	// This is sample data.
	let items = $derived({
		navMain: [
			{
				label: 'Overview',
				menus: [
					{
						title: 'Dashboard',
						url: localizeHref('/panel'),
						icon: LayoutDashboard,
						exact: true,
						groups: ['all', 'hr', 'finance', 'engineering', 'marketing']
					},
					{
						title: 'Analytics',
						url: localizeHref('/panel/analytics'),
						icon: ChartPie,
						groups: ['all', 'finance', 'marketing'],
						permissions: ['reports.read']
					},
					{
						title: 'Calendar',
						url: localizeHref('/panel/calendar'),
						icon: CalendarIcon,
						groups: ['all', 'hr', 'marketing']
					},
					{
						title: 'Reporting',
						url: localizeHref('/panel/reporting'),
						icon: ChartBar,
						groups: ['all', 'hr', 'finance'],
						permissions: ['reports.read']
					},
					{
						title: 'Notifications',
						url: localizeHref('/panel/notifications'),
						icon: Bell,
						groups: ['all']
					},
					{
						title: 'Pengumuman',
						url: localizeHref('/panel/announcements'),
						icon: Megaphone,
						groups: ['all', 'hr', 'marketing'],
						permissions: ['announcements.view']
					}
				]
			},
			{
				label: 'Workspace',
				menus: [
					{
						title: 'Clients & Vendors',
						url: localizeHref('/panel/client'),
						icon: BookUser,
						groups: ['all', 'marketing', 'engineering', 'finance'],
						permissions: ['clients.read']
					},
					{
						title: 'Projects',
						url: localizeHref('/panel/project'),
						icon: FolderGit2,
						groups: ['all', 'engineering', 'finance'],
						permissions: ['projects.read']
					},
					{
						title: 'Layanan',
						url: localizeHref('/panel/masters/services'),
						icon: Briefcase,
						groups: ['all', 'marketing'],
						permissions: ['services.read']
					},
					{
						title: 'Karier',
						url: localizeHref('/panel/career'),
						icon: Briefcase,
						groups: ['all', 'hr'],
						permissions: ['jobs.read']
					}
				]
			},
			{
				label: 'HR & Management',
				menus: [
					{
						title: 'Timesheets',
						url: localizeHref('/panel/hr/timesheets'),
						icon: Clock,
						groups: ['all', 'hr'],
						permissions: ['timesheets.read']
					},
					{
						title: 'Employees',
						url: localizeHref('/panel/hr/employee'),
						icon: Users,
						groups: ['all', 'hr'],
						permissions: ['users.read']
					},
					{
						title: 'Leave',
						url: localizeHref('/panel/hr/leave'),
						icon: CalendarCheck,
						groups: ['all', 'hr'],
						permissions: ['leave_requests.read']
					},
					{
						title: 'Presensi',
						url: localizeHref('/panel/presence'),
						icon: Fingerprint,
						groups: ['all', 'hr'],
						permissions: ['presences.read']
					}
				]
			},
			{
				label: 'Finance',
				menus: [
					{
						title: 'Invoices',
						url: localizeHref('/panel/finance/invoices'),
						icon: ScrollText,
						groups: ['all', 'finance'],
						permissions: ['invoices.read']
					},
					{
						title: 'Expenses',
						url: localizeHref('/panel/finance/expenses'),
						icon: Receipt,
						groups: ['all', 'finance'],
						permissions: ['expenses.read']
					},
					{
						title: 'Payroll',
						url: localizeHref('/panel/finance/payroll'),
						icon: Wallet,
						groups: ['all', 'finance', 'hr'],
						permissions: ['payroll.read']
					}
				]
			},
			{
				label: 'Accounting',
				menus: [
					{
						title: 'Chart of Accounts',
						url: localizeHref('/panel/accounting/accounts'),
						icon: BookOpen,
						groups: ['all', 'finance'],
						permissions: ['accounting.read']
					},
					{
						title: 'Jurnal',
						url: localizeHref('/panel/accounting/journals'),
						icon: ScrollText,
						groups: ['all', 'finance'],
						permissions: ['accounting.read']
					}
				]
			},
			{
				label: 'CRM',
				menus: [
					{
						title: 'Leads',
						url: localizeHref('/panel/crm/leads'),
						icon: Handshake,
						groups: ['all', 'marketing'],
						permissions: ['leads.read']
					},
					{
						title: 'Sales Orders',
						url: localizeHref('/panel/crm/orders'),
						icon: ShoppingCart,
						groups: ['all', 'marketing', 'finance'],
						permissions: ['orders.read']
					}
				]
			},
			{
				label: 'Inventory',
				menus: [
					{
						title: 'Products',
						url: localizeHref('/panel/inventory/products'),
						icon: Package,
						groups: ['all', 'engineering', 'finance'],
						permissions: ['products.read']
					},
					{
						title: 'Stock Moves',
						url: localizeHref('/panel/inventory/stock_moves'),
						icon: ArrowLeftRight,
						groups: ['all', 'engineering', 'finance'],
						permissions: ['stock_moves.read']
					},
					{
						title: 'Warehouses',
						url: localizeHref('/panel/inventory/warehouses'),
						icon: Building,
						groups: ['all', 'engineering', 'finance'],
						permissions: ['warehouses.read']
					},
					{
						title: 'Locations',
						url: localizeHref('/panel/inventory/locations'),
						icon: Tag,
						groups: ['all', 'engineering', 'finance'],
						permissions: ['locations.read']
					}
				]
			},
			{
				label: 'Procurement',
				menus: [
					{
						title: 'Requisitions',
						url: localizeHref('/panel/purchase/requisitions'),
						icon: ScrollText,
						groups: ['all', 'finance', 'engineering'],
						permissions: ['purchase_requisitions.read']
					},
					{
						title: 'Purchase Orders',
						url: localizeHref('/panel/purchase/orders'),
						icon: ShoppingCart,
						groups: ['all', 'finance'],
						permissions: ['purchase_orders.read']
					},
					{
						title: 'Procurement Map',
						url: localizeHref('/panel/purchase/map'),
						icon: Map,
						groups: ['all', 'finance', 'engineering'],
						permissions: ['purchase_orders.read']
					}
				]
			},
			{
				label: 'Front Content',
				menus: [
					{
						title: 'News',
						url: localizeHref('/panel/news'),
						icon: Newspaper,
						groups: ['all', 'marketing'],
						permissions: ['news.read']
					},
					{
						title: 'Contact',
						url: localizeHref('/panel/contact'),
						icon: Contact,
						groups: ['all', 'marketing'],
						permissions: ['pages.read']
					},
					{
						title: 'Subscriptions',
						url: localizeHref('/panel/subscription'),
						icon: MailCheck,
						groups: ['all', 'marketing'],
						permissions: ['pages.read']
					}
				]
			},
			{
				label: 'Master Data',
				menus: [
					{
						title: 'User Management',
						url: localizeHref('/panel/user'),
						icon: Users,
						groups: ['all', 'hr'],
						permissions: ['users.read']
					},
					{
						title: 'Role & Akses',
						url: localizeHref('/panel/masters/roles'),
						icon: Shield,
						groups: ['all', 'hr'],
						permissions: ['roles.read']
					},
					{
						title: 'Positions',
						url: localizeHref('/panel/masters/positions'),
						icon: Database,
						groups: ['all', 'hr'],
						permissions: ['positions.read']
					},
					{
						title: 'Bank',
						url: localizeHref('/panel/masters/banks'),
						icon: Landmark,
						groups: ['all', 'finance', 'hr'],
						permissions: ['banks.read']
					},
					{
						title: 'Schools',
						url: localizeHref('/panel/masters/schools'),
						icon: Database,
						groups: ['all', 'hr'],
						permissions: ['schools.read']
					},
					{
						title: 'Agama',
						url: localizeHref('/panel/masters/religions'),
						icon: Church,
						groups: ['all', 'hr'],
						permissions: ['religions.read']
					},
					{
						title: 'Stages',
						url: localizeHref('/panel/masters/stages'),
						icon: Database,
						groups: ['all', 'hr'],
						permissions: ['stages.read']
					},
					{
						title: 'Units',
						url: localizeHref('/panel/masters/units'),
						icon: Database,
						groups: ['all', 'hr'],
						permissions: ['units.read']
					},
					{
						title: 'Shifts',
						url: localizeHref('/panel/masters/shifts'),
						icon: Clock,
						groups: ['all', 'hr'],
						permissions: ['shifts.read']
					},
					{
						title: 'Salary Components',
						url: localizeHref('/panel/masters/salary-components'),
						icon: Landmark,
						groups: ['all', 'finance', 'hr'],
						permissions: ['banks.read']
					},
					{
						title: 'Tags',
						url: localizeHref('/panel/masters/tags'),
						icon: Tag,
						groups: ['all'],
						permissions: ['tags.read']
					},
					{
						title: 'Categories',
						url: localizeHref('/panel/masters/categories'),
						icon: LayoutGrid,
						groups: ['all'],
						permissions: ['categories.read']
					},
					{
						title: 'Log Activities',
						url: localizeHref('/panel/log'),
						icon: Logs,
						groups: ['all', 'engineering', 'hr'],
						permissions: ['activity_logs.read']
					}
				]
			},
			{
				label: 'Settings',
				menus: [
					{
						title: 'General Settings',
						url: localizeHref(`/panel/setting/${initialLocale}/general`),
						icon: Settings2Icon,
						groups: ['all'],
						permissions: ['settings.read']
					},
					{
						title: 'Organisasi',
						url: localizeHref('/panel/setting/organization'),
						icon: Users,
						groups: ['all'],
						permissions: ['settings.read']
					},
					{
						title: 'Perusahaan',
						url: localizeHref('/panel/setting/company'),
						icon: Building,
						groups: ['all'],
						permissions: ['settings.read']
					},
					{
						title: 'Perangkat',
						url: localizeHref('/panel/setting/devices'),
						icon: Monitor,
						groups: ['all'],
						permissions: ['settings.read']
					}
				]
			},
			{
				label: 'Superadmin',
				menus: [
					{
						title: 'Companies',
						url: localizeHref('/panel/superadmin/companies'),
						icon: ShieldCheck,
						groups: ['all'],
						permissions: ['superadmin.read']
					}
				]
			}
		]
	});

	const isActiveUrl = (path: string, base: string) =>
		path === base ||
		(path.startsWith(base) && (path.length === base.length || path[base.length] === '/'));

	let navItems = $derived.by(() => {
		const path = page.url.pathname;
		return items.navMain
			.map((group) => {
				const filteredMenus = group.menus.filter((menu) => {
					const hasGroup = (menu as unknown as { groups: string[] }).groups.includes(activeModule);

					const reqPerms = (menu as MenuItem).permissions;
					let hasPerms = true;
					if (reqPerms && reqPerms.length > 0) {
						hasPerms = reqPerms.some((req) => data.permissions?.includes(req));
					}

					return hasGroup && hasPerms;
				});
				if (filteredMenus.length === 0) return null;

				return {
					...group,
					menus: filteredMenus.map((menu) => ({
						...menu,
						isActive: (menu as unknown as { exact?: boolean }).exact
							? path === menu.url
							: isActiveUrl(path, menu.url)
					}))
				};
			})
			.filter(Boolean) as typeof items.navMain;
	});
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<CompanySwitcher companies={data.availableCompanies ?? []} activeCompany={data.activeCompany} />
		<TeamSwitcher modules={MODULES} bind:activeModule />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navItems} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser
			user={{
				name: data.user.name ?? '',
				email: data.user.email ?? '',
				avatar: data.user.avatar ?? '',
				id: data.user.id ?? ''
			}}
		/>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
