<script lang="ts">
	import {
		type DateValue,
		getLocalTimeZone,
		today,
		isSameDay,
		startOfMonth,
		endOfMonth
	} from '@internationalized/date';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Clock from '@lucide/svelte/icons/clock';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import TentTree from '@lucide/svelte/icons/tent-tree';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Tag from '@lucide/svelte/icons/tag';
	import User from '@lucide/svelte/icons/user';
	import Activity from '@lucide/svelte/icons/activity';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import X from '@lucide/svelte/icons/x';
	import Settings from '@lucide/svelte/icons/settings';
	import Filter from '@lucide/svelte/icons/filter';
	import Link from '@lucide/svelte/icons/link';
	import { cn } from '$lib/utils';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';

	type CalendarEvent = {
		id: string;
		type: 'task' | 'leave' | 'timesheet' | 'holiday' | 'schedule';
		title: string;
		date: string | Date | null;
		endDate?: string | Date | null;
		status?: string | null;
		priority?: string | null;
		description?: string | null;
		location?: string | null;
		link?: string | null;
		isAllDay?: boolean | null;
		recurrence?: string | null;
		project?: { name: string } | null;
		assignee?: { id: string; name: string } | null;
	};

	let { data } = $props();
	let events = $derived(data.events as CalendarEvent[]);

	// State for current view focus
	let timeZone = 'UTC';
	try {
		timeZone = getLocalTimeZone();
		console.log('[Calendar] Timezone:', timeZone);
	} catch (e) {
		console.error('[Calendar] Failed to get timezone, defaulting to UTC', e);
	}
	let currentDate = $state(today(timeZone));
	let currentMonthStart = $derived(startOfMonth(currentDate));
	let currentMonthEnd = $derived(endOfMonth(currentDate));

	// Interaction States
	let selectedEvent = $state<CalendarEvent | null>(null);
	let isDialogOpen = $state(false);
	let isSettingsOpen = $state(false);
	let isCreateDialogOpen = $state(false);
	let createScheduleDateStr = $state('');
	let showTimeInputs = $state(false);
	let isAllDayChecked = $state(true);
	let recurrenceValue = $state('none');
	let hiddenHolidays = $state<string[]>([]);
	let isDeleteConfirmOpen = $state(false);
	let isHideConfirmOpen = $state(false);

	// Drag & Drop States
	let isDragging = $state(false);
	let draggedEventId = $state<string | null>(null);
	let draggedEventType = $state<string | null>(null);

	// Event Filters
	let filters = $state({
		schedule: true,
		task: true,
		leave: true,
		timesheet: true,
		holiday: true
	});

	onMount(() => {
		const storedHolidays = localStorage.getItem('sv_hidden_holidays');
		if (storedHolidays) {
			hiddenHolidays = JSON.parse(storedHolidays);
		}
	});

	// Date Formatter for Popup (e.g. "Rabu, 18 Maret")
	function formatEventDate(dateValue: string | Date | null, showTime = false) {
		if (!dateValue) return '';
		// If it's a string in YYYY-MM-DD format, ensure local parsing
		let d: Date;
		if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
			d = new Date(`${dateValue}T00:00:00`);
		} else {
			d = new Date(dateValue);
		}

		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		};
		if (showTime) {
			options.hour = '2-digit';
			options.minute = '2-digit';
		}
		return new Intl.DateTimeFormat('id-ID', options).format(d);
	}

	function formatEventTime(dateValue: string | Date | null) {
		if (!dateValue) return '';
		let d: Date;
		if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
			d = new Date(`${dateValue}T00:00:00`);
		} else {
			d = new Date(dateValue);
		}
		return new Intl.DateTimeFormat('id-ID', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(d);
	}

	function handleEventClick(event: CalendarEvent) {
		console.log('[Calendar] Event Clicked:', event);
		selectedEvent = event;
		isDialogOpen = true;
	}

	function openCreateSchedule(date: DateValue) {
		const year = date.year;
		const month = String(date.month).padStart(2, '0');
		const day = String(date.day).padStart(2, '0');
		createScheduleDateStr = `${year}-${month}-${day}`;
		showTimeInputs = false;
		isAllDayChecked = true;
		recurrenceValue = 'none';
		isCreateDialogOpen = true;
	}

	function hideHoliday(eventId: string) {
		if (!hiddenHolidays.includes(eventId)) {
			hiddenHolidays = [...hiddenHolidays, eventId];
			localStorage.setItem('sv_hidden_holidays', JSON.stringify(hiddenHolidays));
		}
		isDialogOpen = false;
	}

	function unhideHoliday(eventId: string) {
		hiddenHolidays = hiddenHolidays.filter((id) => id !== eventId);
		localStorage.setItem('sv_hidden_holidays', JSON.stringify(hiddenHolidays));
	}

	// HTML5 Drag and Drop Handlers
	function handleDragStart(e: DragEvent, event: CalendarEvent) {
		if (event.type === 'holiday') {
			e.preventDefault();
			return; // Holidays are not draggable
		}
		isDragging = true;
		draggedEventId = event.id;
		draggedEventType = event.type;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', event.id);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault(); // allow drop
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	async function handleDrop(e: DragEvent, targetDate: DateValue) {
		e.preventDefault();
		isDragging = false;

		if (!draggedEventId || !draggedEventType) return;

		const year = targetDate.year;
		const month = String(targetDate.month).padStart(2, '0');
		const day = String(targetDate.day).padStart(2, '0');
		const newDateStr = `${year}-${month}-${day}`;

		// Optimistic UI Update (Opsional - For now just form submit)
		const formData = new FormData();
		formData.append('id', draggedEventId);
		formData.append('type', draggedEventType);
		formData.append('newDate', newDateStr);

		draggedEventId = null;
		draggedEventType = null;

		try {
			const res = await fetch('?/updateScheduleDate', {
				method: 'POST',
				body: formData
			});
			if (res.ok) {
				// Refresh page to load new data
				window.location.reload();
			} else {
				console.error('Failed to update event date');
			}
		} catch (error) {
			console.error('Drop error:', error);
		}
	}

	// Calculate calendar grid dates
	let calendarDays = $derived.by(() => {
		const days = [];
		const start = currentMonthStart;
		const end = currentMonthEnd;

		// Helper to get day of week (1=Mon, 7=Sun) without Intl dependency
		function getDayOfWeekSimple(date: DateValue) {
			// DateValue has year, month (1-12), day
			// JS Date has year, month (0-11), day
			const d = new Date(date.year, date.month - 1, date.day);
			const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
			return day === 0 ? 7 : day;
		}

		// Adjust start date backwards to nearest Monday (1)
		let gridStart = start;
		while (getDayOfWeekSimple(gridStart) !== 1) {
			// 1 is Monday
			gridStart = gridStart.add({ days: -1 });
		}

		// Adjust end date forwards to nearest Sunday (7)
		let gridEnd = end;
		while (getDayOfWeekSimple(gridEnd) !== 7) {
			// 7 is Sunday
			gridEnd = gridEnd.add({ days: 1 });
		}

		let iter = gridStart;
		// Use a safe loop limit to prevent infinite loops (max 42 days usually covers a month view)
		// but simple compare check is fine
		while (iter.compare(gridEnd) <= 0) {
			days.push(iter);
			iter = iter.add({ days: 1 });
		}
		return days;
	});

	function nextMonth() {
		currentDate = currentDate.add({ months: 1 });
	}

	function prevMonth() {
		currentDate = currentDate.add({ months: -1 });
	}

	function jumpToToday() {
		currentDate = today(getLocalTimeZone());
	}

	function getEventsForDate(date: DateValue) {
		const dateStr = date.toString();
		return events.filter((event) => {
			if (!event.date) return false;
			// Simple string comparison for 'YYYY-MM-DD'
			let eventDateStr = '';
			if (
				event.date instanceof Date ||
				(typeof event.date === 'string' && event.date.includes('T'))
			) {
				const dObj = event.date instanceof Date ? event.date : new Date(event.date);
				const y = dObj.getFullYear();
				const m = String(dObj.getMonth() + 1).padStart(2, '0');
				const d = String(dObj.getDate()).padStart(2, '0');
				eventDateStr = `${y}-${m}-${d}`;
			} else if (typeof event.date === 'string') {
				// Simple YYYY-MM-DD
				eventDateStr = event.date.split('T')[0];
			}

			// Handle multi-day events like Leaves
			// Use type guard or explicit check for 'leave' type which we know has endDate
			if (event.type === 'leave' && 'endDate' in event && event.endDate) {
				let start = eventDateStr;
				let end = '';
				if (
					event.endDate instanceof Date ||
					(typeof event.endDate === 'string' && event.endDate.includes('T'))
				) {
					const dObj = event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
					const y = dObj.getFullYear();
					const m = String(dObj.getMonth() + 1).padStart(2, '0');
					const d = String(dObj.getDate()).padStart(2, '0');
					end = `${y}-${m}-${d}`;
				} else if (typeof event.endDate === 'string') {
					end = event.endDate.split('T')[0];
				}

				// Check if current date is within range [start, end]
				return dateStr >= start && dateStr <= end;
			}

			return eventDateStr === dateStr;
		});
	}

	const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

	const monthNames = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember'
	];
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<Card.Root class="flex h-full flex-col">
		<Card.Header class="flex flex-row items-center justify-between pb-4">
			<div>
				<Card.Title class="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-100">
					{monthNames[currentDate.month - 1]}
					{currentDate.year}
				</Card.Title>
				<Card.Description class="text-muted-foreground"
					>Kelola tugas, jadwal, dan absensi Anda.</Card.Description
				>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="sm" onclick={prevMonth}>
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onclick={jumpToToday}>Hari Ini</Button>
				<Button variant="outline" size="sm" onclick={nextMonth}>
					<ChevronRight class="h-4 w-4" />
				</Button>
				<div class="bg-border mx-1 h-6 w-px"></div>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline" size="sm" class="gap-2">
							<Filter class="h-4 w-4" />
							<span class="hidden sm:inline">Filter</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.Label>Jenis Acara</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.CheckboxItem bind:checked={filters.schedule}>
							Jadwal / Agenda
						</DropdownMenu.CheckboxItem>
						<DropdownMenu.CheckboxItem bind:checked={filters.task}>
							Tugas Khusus
						</DropdownMenu.CheckboxItem>
						<DropdownMenu.CheckboxItem bind:checked={filters.leave}
							>Cuti / Izin</DropdownMenu.CheckboxItem
						>
						<DropdownMenu.CheckboxItem bind:checked={filters.timesheet}>
							Kehadiran / Log
						</DropdownMenu.CheckboxItem>
						<DropdownMenu.CheckboxItem bind:checked={filters.holiday}>
							Libur Nasional
						</DropdownMenu.CheckboxItem>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9"
					onclick={() => (isSettingsOpen = true)}
					title="Pengaturan Kalender"
				>
					<Settings class="h-4 w-4" />
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="flex-1 p-0">
			<!-- Calendar Grid -->
			<div
				class="text-muted-foreground bg-muted/50 grid grid-cols-7 border-b text-center text-sm font-medium"
			>
				{#each weekDays as day (day)}
					<div class="border-r py-3 last:border-r-0">{day}</div>
				{/each}
			</div>
			<div class="bg-background grid flex-1 auto-rows-[minmax(120px,1fr)] grid-cols-7">
				{#each calendarDays as date (date.toString())}
					{@const isCurrentMonth = date.month === currentMonthStart.month}
					{@const isToday = isSameDay(date, today(getLocalTimeZone()))}
					{@const rawEvents = getEventsForDate(date)}
					{@const events = rawEvents.filter((e) => {
						// Filter berdasarkan setelan visibilitas jenis acara
						if (!filters[e.type as keyof typeof filters]) return false;
						// Jangan tampilkan holiday yang disembunyikan
						if (e.type === 'holiday' && hiddenHolidays.includes(e.id)) return false;
						return true;
					})}

					<div
						onclick={() => openCreateSchedule(date)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								openCreateSchedule(date);
								e.preventDefault();
							}
						}}
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, date)}
						role="button"
						tabindex="0"
						class={cn(
							'hover:bg-muted/10 flex min-h-[120px] cursor-pointer flex-col gap-1 border-r border-b p-2 transition-colors last:border-r-0',
							!isCurrentMonth && 'bg-muted/30 text-muted-foreground',
							isToday && 'bg-primary/5',
							isDragging && 'hover:bg-primary/10'
						)}
					>
						<div class="flex items-center justify-between">
							<span
								class={cn(
									'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
									isToday && 'bg-primary text-primary-foreground'
								)}
							>
								{date.day}
							</span>
						</div>

						<div class="no-scrollbar mt-1 flex max-h-[100px] flex-col gap-1 overflow-y-auto">
							{#each events as event (event.id)}
								<div
									draggable={event.type !== 'holiday'}
									ondragstart={(e) => handleDragStart(e, event)}
									ondragend={() => (isDragging = false)}
									onclick={(e) => {
										e.stopPropagation();
										handleEventClick(event);
									}}
									class={cn(
										'cursor-pointer truncate rounded border px-2 py-1 text-xs transition-opacity hover:opacity-80',
										event.type === 'task' &&
											'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
										event.type === 'leave' &&
											'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300',
										event.type === 'timesheet' &&
											'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300',
										event.type === 'holiday' &&
											'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
									)}
									title={event.title}
									role="button"
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											handleEventClick(event);
											e.preventDefault();
										}
									}}
								>
									<!-- Icon based on type -->
									<div class="flex items-center gap-1">
										{#if event.type === 'task'}
											<CheckCircle2 class="h-3 w-3 shrink-0" />
										{:else if event.type === 'leave'}
											<CalendarDays class="h-3 w-3 shrink-0" />
										{:else if event.type === 'holiday'}
											<TentTree class="h-3 w-3 shrink-0" />
										{:else}
											<Clock class="h-3 w-3 shrink-0" />
										{/if}
										<span class="truncate font-medium">{event.title}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Event Detail Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[450px]" showCloseButton={false}>
		{#if selectedEvent}
			<Dialog.Header>
				<Dialog.Title class="sr-only">Detail Acara</Dialog.Title>
			</Dialog.Header>

			<!-- Custom Top-Right Actions (Beside Close Button) -->
			<div class="absolute top-4 right-4 z-20 flex items-center gap-1">
				{#if selectedEvent.type === 'holiday'}
					<Button
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-full"
						onclick={() => (isHideConfirmOpen = true)}
						title="Sembunyikan Hari Libur Ini"
					>
						<EyeOff class="h-4 w-4" />
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="icon"
						class="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full"
						onclick={() => (isDeleteConfirmOpen = true)}
						title={m.tooltip_delete_event()}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				{/if}
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 rounded-full"
					onclick={() => (isDialogOpen = false)}
					title="Tutup"
				>
					<X class="h-4 w-4" />
					<span class="sr-only">Tutup</span>
				</Button>
			</div>

			<!-- Header Section with Color Accent -->
			<div class="relative -mx-6 -mt-6 mb-4 h-28 overflow-hidden rounded-t-lg">
				<div
					class={cn(
						'absolute inset-0 opacity-15',
						selectedEvent.type === 'holiday'
							? 'bg-orange-500'
							: selectedEvent.type === 'task'
								? 'bg-blue-500'
								: selectedEvent.type === 'leave'
									? 'bg-red-500'
									: 'bg-green-500'
					)}
				></div>
				<div class="relative flex h-full items-center px-6 pt-2">
					<div
						class={cn(
							'ring-background flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-4',
							selectedEvent.type === 'holiday'
								? 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
								: selectedEvent.type === 'task'
									? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
									: selectedEvent.type === 'leave'
										? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
										: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
						)}
					>
						{#if selectedEvent.type === 'task'}
							<CheckCircle2 class="h-7 w-7" />
						{:else if selectedEvent.type === 'leave'}
							<CalendarDays class="h-7 w-7" />
						{:else if selectedEvent.type === 'holiday'}
							<TentTree class="h-7 w-7" />
						{:else}
							<Clock class="h-7 w-7" />
						{/if}
					</div>
					<div class="ml-4 flex flex-col justify-center">
						<Badge
							variant="secondary"
							class={cn(
								'mb-1.5 w-fit text-[10px] font-bold tracking-widest uppercase transition-colors',
								selectedEvent.type === 'holiday'
									? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300'
									: selectedEvent.type === 'task'
										? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
										: selectedEvent.type === 'leave'
											? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300'
											: 'bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300'
							)}
						>
							{#if selectedEvent.type === 'holiday'}
								{m.national_holiday_desc()}
							{:else if selectedEvent.type === 'task'}
								Tugas Internal
							{:else if selectedEvent.type === 'leave'}
								Cuti / Izin
							{:else if selectedEvent.type === 'schedule'}
								Agenda
							{:else}
								{selectedEvent.type}
							{/if}
						</Badge>
						<h2 class="text-foreground text-xl leading-tight font-bold">
							{selectedEvent.title}
						</h2>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-5">
				<!-- Time Section -->
				<div class="flex items-center gap-3">
					<div
						class="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full"
					>
						<CalendarDays class="h-5 w-5" />
					</div>
					<div class="flex flex-col">
						<span class="text-muted-foreground text-[10px] font-bold tracking-wider uppercase"
							>Waktu & Tanggal</span
						>
						<p class="text-sm font-semibold">
							{#if selectedEvent.type === 'holiday' || selectedEvent.isAllDay}
								{formatEventDate(selectedEvent.date || null)}
								{#if selectedEvent.endDate}
									{@const startD = new Date(selectedEvent.date || '')}
									{@const endD = new Date(selectedEvent.endDate)}
									{#if startD.getFullYear() !== endD.getFullYear() || startD.getMonth() !== endD.getMonth() || startD.getDate() !== endD.getDate()}
										<span class="text-muted-foreground mx-1"> – </span>
										{formatEventDate(endD)}
									{/if}
								{/if}
							{:else}
								{@const startDt =
									typeof selectedEvent.date === 'string' &&
									/^\d{4}-\d{2}-\d{2}$/.test(selectedEvent.date)
										? new Date(`${selectedEvent.date}T00:00:00`)
										: new Date(selectedEvent.date || '')}
								{@const endDt = selectedEvent.endDate
									? typeof selectedEvent.endDate === 'string' &&
										/^\d{4}-\d{2}-\d{2}$/.test(selectedEvent.endDate)
										? new Date(`${selectedEvent.endDate}T00:00:00`)
										: new Date(selectedEvent.endDate)
									: null}

								{formatEventDate(startDt)}
								<span class="text-muted-foreground mx-1"> • </span>

								{#if endDt}
									{@const isSameDay =
										startDt.getFullYear() === endDt.getFullYear() &&
										startDt.getMonth() === endDt.getMonth() &&
										startDt.getDate() === endDt.getDate()}

									{#if isSameDay}
										{#if startDt.getTime() !== endDt.getTime()}
											{formatEventTime(startDt)} – {formatEventTime(endDt)}
										{:else}
											{formatEventTime(startDt)}
										{/if}
									{:else}
										{formatEventTime(startDt)} – {formatEventDate(endDt, true)}
									{/if}
								{:else}
									{formatEventTime(startDt)}
								{/if}
							{/if}
						</p>
					</div>
				</div>

				<Separator />

				<!-- Description Section (If available) -->
				{#if selectedEvent.description}
					<div class="flex flex-col gap-2">
						<div class="text-muted-foreground flex items-center gap-2">
							<AlignLeft class="h-4 w-4" />
							<span class="text-[10px] font-bold tracking-wider uppercase">Deskripsi</span>
						</div>
						<div class="bg-muted/40 rounded-xl border border-dashed p-4">
							<p class="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
								{selectedEvent.description}
							</p>
						</div>
					</div>
					<Separator />
				{/if}

				<!-- Metadata Grid -->
				<div class="grid grid-cols-2 gap-x-4 gap-y-5">
					{#if selectedEvent.assignee}
						<div class="flex flex-col gap-1.5">
							<div class="text-muted-foreground flex items-center gap-2">
								<User class="h-3.5 w-3.5" />
								<span class="text-[10px] font-bold tracking-wider uppercase">Partisipan</span>
							</div>
							<span class="text-sm font-medium">{selectedEvent.assignee.name}</span>
						</div>
					{/if}

					{#if selectedEvent.status}
						<div class="flex flex-col gap-1.5">
							<div class="text-muted-foreground flex items-center gap-2">
								<Activity class="h-3.5 w-3.5" />
								<span class="text-[10px] font-bold tracking-wider uppercase">Status</span>
							</div>
							<Badge variant="outline" class="w-fit text-[11px] font-medium capitalize">
								{selectedEvent.status}
							</Badge>
						</div>
					{/if}

					{#if selectedEvent.location}
						<div class="flex flex-col gap-1.5">
							<div class="text-muted-foreground flex items-center gap-2">
								<Tag class="h-3.5 w-3.5" />
								<span class="text-[10px] font-bold tracking-wider uppercase">Lokasi</span>
							</div>
							<span class="truncate text-sm font-medium" title={selectedEvent.location}>
								{selectedEvent.location}
							</span>
						</div>
					{/if}

					{#if selectedEvent.link}
						<div class="col-span-2 flex flex-col gap-1.5">
							<div class="text-muted-foreground flex items-center gap-2">
								<Link class="h-3.5 w-3.5" />
								<span class="text-[10px] font-bold tracking-wider uppercase">Link / Tautan</span>
							</div>
							<a
								href={selectedEvent.link}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary group flex items-center gap-1.5 text-sm font-medium hover:underline"
							>
								<span class="truncate">{selectedEvent.link}</span>
								<span class="text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
									>↗</span
								>
							</a>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation -->
<AlertDialog.Root bind:open={isDeleteConfirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.confirm_delete_agenda_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.confirm_delete_agenda_desc()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/deleteEvent"
				use:enhance={({ formData }) => {
					console.log('[Calendar] Submitting deleteEvent:', Object.fromEntries(formData));
					return async ({ result, update }) => {
						console.log('[Calendar] Result deleteEvent:', result);
						if (result.type === 'success') {
							isDeleteConfirmOpen = false;
							isDialogOpen = false;
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={selectedEvent?.id} />
				<input type="hidden" name="type" value={selectedEvent?.type} />
				<AlertDialog.Action
					type="submit"
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>
					{m.btn_delete()}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Hide Holiday Confirmation -->
<AlertDialog.Root bind:open={isHideConfirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.confirm_hide_holiday_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				{m.confirm_hide_holiday_desc()}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{m.btn_cancel()}</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					hideHoliday(selectedEvent?.id || '');
					isHideConfirmOpen = false;
					isDialogOpen = false;
				}}
			>
				{m.btn_hide()}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Hidden Holidays Settings Dialog -->
<Dialog.Root bind:open={isSettingsOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{m.calendar_settings_title()}</Dialog.Title>
			<Dialog.Description>
				{m.calendar_settings_desc()}
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4 flex flex-col gap-3">
			<h3 class="text-sm font-medium">{m.hidden_holidays_label()}</h3>

			{#if hiddenHolidays.length === 0}
				<div
					class="text-muted-foreground flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center text-sm"
				>
					<EyeOff class="mb-2 h-8 w-8 opacity-20" />
					<p>{m.no_hidden_holidays()}</p>
				</div>
			{:else}
				<div class="bg-muted/30 flex max-h-[250px] flex-col overflow-y-auto rounded-md border">
					{#each events.filter((e) => e.type === 'holiday' && hiddenHolidays.includes(e.id)) as holiday (holiday.id)}
						<div class="flex items-center justify-between border-b p-3 last:border-0">
							<div class="flex flex-col">
								<span class="text-sm font-medium">{holiday.title}</span>
								<span class="text-muted-foreground text-xs"
									>{formatEventDate(holiday.date || null)}</span
								>
							</div>
							<Button
								variant="outline"
								size="sm"
								class="h-8 shadow-none"
								onclick={() => unhideHoliday(holiday.id)}
							>
								{m.btn_unhide()}
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Create Schedule Dialog -->
<Dialog.Root bind:open={isCreateDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{m.create_schedule_title()}</Dialog.Title>
			<Dialog.Description>{m.create_schedule_desc()}</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/createSchedule"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						isCreateDialogOpen = false;
					}
					await update();
				};
			}}
		>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="title">Judul Acara</Label>
					<Input id="title" name="title" required placeholder="Mis. Rapat Klien, Makan Siang" />
				</div>
				<!-- Refined Date/Time section -->
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<Clock class="text-muted-foreground h-4 w-4" />
						<div class="flex flex-1 flex-col">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">
									{createScheduleDateStr ? formatEventDate(createScheduleDateStr) : ''}
									{#if isAllDayChecked}
										– {createScheduleDateStr ? formatEventDate(createScheduleDateStr) : ''}
									{/if}
								</span>

								<div class="flex items-center gap-2">
									<Checkbox
										id="isAllDay"
										name="isAllDay"
										bind:checked={isAllDayChecked}
										class="cursor-pointer"
									/>
									<Label for="isAllDay" class="cursor-pointer text-xs font-normal"
										>Sepanjang hari</Label
									>
								</div>
							</div>

							<input type="hidden" name="startDate" value={createScheduleDateStr} />
							<input type="hidden" name="endDate" value={createScheduleDateStr} />

							{#if !showTimeInputs && !isAllDayChecked}
								<Button
									variant="link"
									type="button"
									class="h-auto justify-start p-0 text-xs"
									onclick={() => {
										showTimeInputs = true;
										isAllDayChecked = false;
									}}
								>
									{m.btn_add_time()}
								</Button>
							{/if}
						</div>
					</div>

					{#if showTimeInputs && !isAllDayChecked}
						<div class="ml-7 space-y-3 border-l pl-3">
							<div class="flex items-center gap-2">
								<Input type="time" name="startTime" class="h-8 w-24 px-2 text-xs" />
								<span class="text-xs">–</span>
								<Input type="time" name="endTime" class="h-8 w-24 px-2 text-xs" />
							</div>

							<div class="grid gap-1.5 overflow-visible">
								<Label class="text-xs">Perulangan</Label>
								<Select.Root type="single" name="recurrence" bind:value={recurrenceValue}>
									<Select.Trigger class="h-8 w-full cursor-pointer text-xs">
										{recurrenceValue === 'none'
											? 'Tidak berulang'
											: recurrenceValue === 'daily'
												? 'Setiap hari'
												: recurrenceValue === 'weekly'
													? 'Mingguan'
													: recurrenceValue === 'monthly'
														? 'Bulanan'
														: recurrenceValue === 'annually'
															? 'Tahunan'
															: recurrenceValue === 'weekday'
																? 'Setiap hari kerja (Sen-Jum)'
																: 'Pilih perulangan'}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="none" label="Tidak berulang">Tidak berulang</Select.Item>
										<Select.Item value="daily" label="Setiap hari">Setiap hari</Select.Item>
										<Select.Item value="weekly" label="Mingguan">Mingguan</Select.Item>
										<Select.Item value="monthly" label="Bulanan">Bulanan</Select.Item>
										<Select.Item value="annually" label="Tahunan">Tahunan</Select.Item>
										<Select.Item value="weekday" label="Setiap hari kerja (Sen-Jum)">
											Setiap hari kerja (Sen-Jum)
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{:else if isAllDayChecked}
						<div class="ml-7 space-y-3 border-l pl-3">
							<div class="grid gap-1.5 overflow-visible">
								<Label class="text-xs">Perulangan</Label>
								<Select.Root type="single" name="recurrence" bind:value={recurrenceValue}>
									<Select.Trigger class="h-8 w-full cursor-pointer text-xs">
										{recurrenceValue === 'none'
											? 'Tidak berulang'
											: recurrenceValue === 'daily'
												? 'Setiap hari'
												: recurrenceValue === 'weekly'
													? 'Mingguan'
													: recurrenceValue === 'monthly'
														? 'Bulanan'
														: recurrenceValue === 'annually'
															? 'Tahunan'
															: recurrenceValue === 'weekday'
																? 'Setiap hari kerja (Sen-Jum)'
																: 'Pilih perulangan'}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="none" label="Tidak berulang">Tidak berulang</Select.Item>
										<Select.Item value="daily" label="Setiap hari">Setiap hari</Select.Item>
										<Select.Item value="weekly" label="Mingguan">Mingguan</Select.Item>
										<Select.Item value="monthly" label="Bulanan">Bulanan</Select.Item>
										<Select.Item value="annually" label="Tahunan">Tahunan</Select.Item>
										<Select.Item value="weekday" label="Setiap hari kerja (Sen-Jum)">
											Setiap hari kerja (Sen-Jum)
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="location">Lokasi (Opsional)</Label>
					<Input id="location" name="location" placeholder="Mis. Ruang Rapat 1, Online" />
				</div>
				<div class="grid gap-2">
					<Label for="link">Tautan Rapat / URL (Opsional)</Label>
					<Input id="link" name="link" type="url" placeholder="Mis. https://meet.google.com/..." />
				</div>
				<div class="grid gap-2">
					<Label for="description">Catatan (Opsional)</Label>
					<textarea
						id="description"
						name="description"
						class="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Detail tambahan mengenai acara"
					></textarea>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isCreateDialogOpen = false)}>
					{m.btn_cancel()}
				</Button>
				<Button type="submit">{m.btn_save()}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Hide scrollbar for cleaner look in event list */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
