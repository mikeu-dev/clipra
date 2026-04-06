/* eslint-disable svelte/prefer-svelte-reactivity */
import { browser } from '$app/environment';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import { SvelteDate } from 'svelte/reactivity';

export type DateRangePreset = 'today' | 'last-7-days' | 'last-30-days' | 'this-month' | 'custom';

export interface DateRange {
	start: SvelteDate;
	end: SvelteDate;
	preset: DateRangePreset;
}

export class AnalyticsStore {
	range = $state<DateRange>({
		start: new SvelteDate(startOfMonth(new Date())),
		end: new SvelteDate(endOfMonth(new Date())),
		preset: 'this-month'
	});

	isLoading = $state(false);

	constructor() {
		if (browser) {
			// Restore from URL or local storage if needed later
		}
	}

	setRange(preset: DateRangePreset, customStart?: Date, customEnd?: Date) {
		const now = new Date();
		this.range.preset = preset;

		switch (preset) {
			case 'today':
				this.range.start = new SvelteDate(startOfDay(now));
				this.range.end = new SvelteDate(endOfDay(now));
				break;
			case 'last-7-days':
				this.range.start = new SvelteDate(startOfDay(subDays(now, 7)));
				this.range.end = new SvelteDate(endOfDay(now));
				break;
			case 'last-30-days':
				this.range.start = new SvelteDate(startOfDay(subDays(now, 30)));
				this.range.end = new SvelteDate(endOfDay(now));
				break;
			case 'this-month':
				this.range.start = new SvelteDate(startOfMonth(now));
				this.range.end = new SvelteDate(endOfMonth(now));
				break;
			case 'custom':
				if (customStart && customEnd) {
					this.range.start = new SvelteDate(customStart);
					this.range.end = new SvelteDate(customEnd);
				}
				break;
		}
	}
}

export const analyticsStore = new AnalyticsStore();
