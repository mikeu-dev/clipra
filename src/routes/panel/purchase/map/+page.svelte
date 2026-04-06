<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { PageData } from './$types';

	import Search from '@lucide/svelte/icons/search';
	import Building from '@lucide/svelte/icons/building';
	import Store from '@lucide/svelte/icons/store';
	import Construction from '@lucide/svelte/icons/construction';
	import Navigation from '@lucide/svelte/icons/navigation';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import ToggleRight from '@lucide/svelte/icons/toggle-right';
	import ToggleLeft from '@lucide/svelte/icons/toggle-left';
	import 'leaflet/dist/leaflet.css';

	let { data } = $props<{ data: PageData }>();

	let mapElement: HTMLDivElement;
	let map: import('leaflet').Map;
	let L: typeof import('leaflet');
	let markers: import('leaflet').Marker[] = [];
	let resizeObserver: ResizeObserver;

	let searchQuery = $state('');
	let activeTab = $state('all');
	let sidebarOpen = $state(true);

	// Derived data for sidebar
	const filteredItems = $derived(() => {
		const q = searchQuery.toLowerCase();
		let items = [
			...data.warehouses.map((i: (typeof data.warehouses)[number]) => ({
				...i,
				type: 'warehouse' as const,
				icon: Building,
				color: 'bg-blue-600'
			})),
			...data.vendors.map((i: (typeof data.vendors)[number]) => ({
				...i,
				type: 'vendor' as const,
				icon: Store,
				color: 'bg-orange-600'
			})),
			...data.projects.map((i: (typeof data.projects)[number]) => ({
				...i,
				type: 'project' as const,
				icon: Construction,
				color: 'bg-green-600'
			}))
		];

		if (activeTab !== 'all') {
			items = items.filter((i) => i.type === activeTab);
		}

		if (q) {
			items = items.filter((i) => i.name.toLowerCase().includes(q));
		}

		return items;
	});

	function flyTo(lat: number, lng: number) {
		if (map) {
			map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
			// Find marker and open popup
			const marker = markers.find((m) => m.getLatLng().lat === lat && m.getLatLng().lng === lng);
			if (marker) marker.openPopup();
		}
	}

	onMount(async () => {
		if (typeof window !== 'undefined') {
			L = await import('leaflet');
			if (map) return;

			map = L.map(mapElement, { zoomControl: false }).setView([-6.1754, 106.8272], 10);
			L.control.zoom({ position: 'bottomright' }).addTo(map);

			L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
				attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
			}).addTo(map);

			const createIcon = (color: string, iconHtml: string) =>
				L.divIcon({
					html: `<div class="flex items-center justify-center w-10 h-10 ${color} rounded-full border-4 border-white shadow-xl transform transition-transform hover:scale-110">${iconHtml}</div>`,
					className: '',
					iconSize: [40, 40],
					iconAnchor: [20, 20],
					popupAnchor: [0, -20]
				});

			const icons = {
				warehouse: createIcon(
					'bg-blue-600',
					'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
				),
				vendor: createIcon(
					'bg-orange-600',
					'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
				),
				project: createIcon(
					'bg-green-600',
					'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
				)
			};

			const bounds = L.latLngBounds([]);

			// Helper to add markers
			const addMarker = (
				item: {
					latitude: string | number;
					longitude: string | number;
					name: string;
					address?: string | null;
				},
				type: keyof typeof icons
			) => {
				const m = L.marker([Number(item.latitude), Number(item.longitude)], {
					icon: icons[type]
				}).addTo(map).bindPopup(`
						<div class="p-2 min-w-[200px]">
							<h3 class="font-bold text-lg border-b pb-1 mb-2">${item.name}</h3>
							<p class="text-sm text-gray-600 mb-2">${item.address || 'No address'}</p>
							<div class="flex justify-between items-center mt-3">
								<span class="text-xs font-semibold px-2 py-1 rounded bg-gray-100 uppercase">${type}</span>
								<a href="/panel/${type === 'vendor' ? 'client' : type === 'warehouse' ? 'inventory/warehouses' : 'project'}" 
								   class="text-blue-600 text-xs font-bold hover:underline">View Details →</a>
							</div>
						</div>
					`);
				markers.push(m);
				bounds.extend(m.getLatLng());
			};

			data.warehouses.forEach((w: (typeof data.warehouses)[number]) => addMarker(w, 'warehouse'));
			data.vendors.forEach((v: (typeof data.vendors)[number]) => addMarker(v, 'vendor'));
			data.projects.forEach((p: (typeof data.projects)[number]) => addMarker(p, 'project'));

			// Routes with animation feel
			data.orders.forEach((order: (typeof data.orders)[number]) => {
				const supplier = data.vendors.find(
					(v: (typeof data.vendors)[number]) => v.id === order.supplierId
				);
				let dest: { latitude: string | number; longitude: string | number } | undefined =
					order.warehouseId
						? data.warehouses.find(
								(w: (typeof data.warehouses)[number]) => w.id === order.warehouseId
							)
						: data.projects.find((p: (typeof data.projects)[number]) => p.id === order.projectId);

				if (supplier && dest && supplier.latitude && dest.latitude) {
					L.polyline(
						[
							[Number(supplier.latitude), Number(supplier.longitude)],
							[Number(dest.latitude), Number(dest.longitude)]
						],
						{
							color: order.state === 'purchase' ? '#16a34a' : '#94a3b8',
							weight: 4,
							dashArray: '10, 10',
							opacity: 0.6
						}
					)
						.addTo(map)
						.bindPopup(
							`<b>Order: ${order.number}</b><br>Amount: IDR ${Number(order.total).toLocaleString()}`
						);
				}
			});

			if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });

			// Use ResizeObserver for perfect responsivity
			resizeObserver = new ResizeObserver(() => {
				if (map) {
					map.invalidateSize({ animate: false });
				}
			});
			resizeObserver.observe(mapElement);
		}
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (map) map.remove();
	});
</script>

<div class="bg-background flex h-screen flex-col overflow-hidden">
	<header class="z-20 flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
		<div class="flex flex-col gap-0.5">
			<h1 class="text-sm leading-none font-bold tracking-tight text-blue-900 dark:text-blue-100">
				Peta Pengadaan
			</h1>
			<p class="text-muted-foreground text-[10px]">
				Visualisasi rantai pasok dan rute pengiriman barang.
			</p>
		</div>
		<div class="flex items-center gap-4">
			<Badge variant="outline" class="border-blue-200 bg-blue-50 text-blue-700"
				>{data.warehouses.length} Warehouses</Badge
			>
			<Badge variant="outline" class="border-orange-200 bg-orange-50 text-orange-700"
				>{data.vendors.length} Vendors</Badge
			>
			<Badge variant="outline" class="border-green-200 bg-green-50 text-green-700"
				>{data.projects.length} Projects</Badge
			>
		</div>
	</header>

	<div class="relative flex flex-1 overflow-hidden">
		<!-- Sidebar -->
		<aside
			class="z-10 flex flex-col overflow-hidden border-r bg-slate-50 transition-all duration-300"
			class:w-80={sidebarOpen}
			class:w-0={!sidebarOpen}
			class:border-none={!sidebarOpen}
		>
			<div class="border-b bg-white p-4">
				<div class="mb-4 grid grid-cols-2 gap-2">
					<Card.Root class="border-blue-100 bg-blue-50/50 p-2 shadow-none">
						<p class="mb-1 text-[10px] font-bold text-blue-600 uppercase">Total Assets</p>
						<p class="text-xl font-bold text-blue-900">
							{data.warehouses.length + data.projects.length}
						</p>
					</Card.Root>
					<Card.Root class="border-orange-100 bg-orange-50/50 p-2 shadow-none">
						<p class="mb-1 text-[10px] font-bold text-orange-600 uppercase">Active Routes</p>
						<p class="text-xl font-bold text-orange-900">{data.orders.length}</p>
					</Card.Root>
				</div>
				<div class="relative mb-4">
					<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						type="search"
						placeholder="Cari lokasi..."
						class="bg-slate-50 pl-8"
						bind:value={searchQuery}
					/>
				</div>
				<Tabs.Root bind:value={activeTab} class="w-full">
					<Tabs.List class="grid h-9 w-full grid-cols-4">
						<Tabs.Trigger value="all" class="text-xs">All</Tabs.Trigger>
						<Tabs.Trigger value="warehouse" class="text-xs">WH</Tabs.Trigger>
						<Tabs.Trigger value="vendor" class="text-xs">VD</Tabs.Trigger>
						<Tabs.Trigger value="project" class="text-xs">PR</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<ScrollArea class="flex-1">
				<div class="space-y-1 p-2">
					{#each filteredItems() as item (item.id)}
						<button
							onclick={() => flyTo(Number(item.latitude), Number(item.longitude))}
							class="group w-full rounded-lg border border-transparent p-3 text-left transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm"
						>
							<div class="flex gap-3">
								<div
									class={`mt-1 h-8 w-8 shrink-0 rounded-full ${item.color} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}
								>
									<item.icon class="h-4 w-4" />
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm leading-tight font-semibold text-slate-900">
										{item.name}
									</p>
									<p class="text-muted-foreground truncate text-xs leading-relaxed">
										{item.address || 'Tanpa alamat'}
									</p>
								</div>
								<div class="flex items-center">
									<Navigation
										class="h-3 w-3 text-slate-300 transition-colors group-hover:text-blue-500"
									/>
								</div>
							</div>
						</button>
					{:else}
						<div
							class="flex flex-col items-center justify-center py-12 text-muted-foreground italic"
						>
							<MapPin class="w-8 h-8 opacity-20 mb-2" />
							<p class="text-sm">Tidak ditemukan</p>
						</div>
					{/each}
				</div>
			</ScrollArea>
		</aside>

		<!-- Map Container -->
		<main class="relative min-w-0 flex-1">
			<div bind:this={mapElement} class="h-full w-full"></div>

			<div class="absolute top-4 left-4 z-400 flex flex-col gap-2">
				<Button
					variant="secondary"
					size="icon"
					class="bg-white text-slate-700 shadow-md hover:bg-slate-50"
					onclick={() => (sidebarOpen = !sidebarOpen)}
				>
					{#if sidebarOpen}
						<ToggleLeft class="h-5 w-5" />
					{:else}
						<ToggleRight class="h-5 w-5" />
					{/if}
				</Button>
			</div>

			<!-- Floating Legend -->
			<div
				class="absolute bottom-10 left-10 z-400 min-w-[200px] rounded-xl border bg-white/90 p-4 shadow-2xl backdrop-blur-sm"
			>
				<h4 class="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
					Peta Pengadaan
				</h4>
				<div class="space-y-2 text-xs font-medium">
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full border border-white bg-blue-600"></div>
						<span>Logistik (Gudang)</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full border border-white bg-orange-600"></div>
						<span>Suplai (Vendor)</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded-full border border-white bg-green-600"></div>
						<span>Tujuan (Proyek)</span>
					</div>
					<Separator class="my-2" />
					<div class="flex items-center gap-2">
						<div class="h-1 w-6 border-t-2 border-dashed border-green-600"></div>
						<span>Route Aktif</span>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	:global(.leaflet-container) {
		font-family: inherit;
		background: #f1f5f9;
		width: 100% !important;
		height: 100% !important;
	}
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 12px;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
	}

	:global(.leaflet-pane .leaflet-path) {
		stroke-dasharray: 10, 10;
		animation: dash 20s linear infinite;
	}

	@keyframes dash {
		from {
			stroke-dashoffset: 500;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
