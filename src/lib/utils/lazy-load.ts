/**
 * Lazy load utility for Svelte components
 * Provides better code splitting and performance
 */

/**
 * Lazy load a component with loading state
 * @example
 * const LazyChart = lazyLoad(() => import('./ChartWidget.svelte'));
 */
export function lazyLoad<T extends Record<string, unknown>>(
	importer: () => Promise<T>,
	options: {
		loading?: unknown;
		error?: unknown;
		delay?: number;
	} = {}
) {
	const { error, delay = 200 } = options;

	return async () => {
		try {
			// Add artificial delay to prevent flash of loading state
			const [component] = await Promise.all([
				importer(),
				new Promise((resolve) => setTimeout(resolve, delay))
			]);
			return component;
		} catch (err) {
			console.error('Failed to load component:', err);
			if (error) return error;
			throw err;
		}
	};
}

/**
 * Preload a component for better UX
 * @example
 * preloadComponent(() => import('./HeavyComponent.svelte'));
 */
export function preloadComponent<T>(importer: () => Promise<T>): void {
	// Start loading but don't wait
	importer().catch((err) => {
		console.warn('Failed to preload component:', err);
	});
}

/**
 * Lazy load multiple components
 * @example
 * const { Chart, Table } = await lazyLoadMultiple({
 *   Chart: () => import('./Chart.svelte'),
 *   Table: () => import('./Table.svelte')
 * });
 */
export async function lazyLoadMultiple<T extends Record<string, () => Promise<unknown>>>(
	importers: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
	const entries = Object.entries(importers);
	const components = await Promise.all(entries.map(([, importer]) => importer()));

	return Object.fromEntries(entries.map(([key], index) => [key, components[index]])) as unknown as {
		[K in keyof T]: Awaited<ReturnType<T[K]>>;
	};
}

/**
 * Check if component is in viewport before loading
 * Useful for below-the-fold components
 */
export function lazyLoadOnVisible(
	importer: () => Promise<unknown>,
	options: IntersectionObserverInit = {}
) {
	return {
		importer,
		options: {
			rootMargin: '50px',
			...options
		}
	};
}
