/**
 * Image optimization utilities
 */

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
	baseUrl: string,
	widths: number[] = [320, 640, 960, 1280, 1920]
): string {
	return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Get optimal image size based on viewport
 */
export function getOptimalImageSize(containerWidth: number): number {
	const sizes = [320, 640, 960, 1280, 1920];
	return sizes.find((size) => size >= containerWidth) || sizes[sizes.length - 1];
}

/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(img: HTMLImageElement, options: IntersectionObserverInit = {}) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const target = entry.target as HTMLImageElement;
					const src = target.dataset.src;
					const srcset = target.dataset.srcset;

					if (src) target.src = src;
					if (srcset) target.srcset = srcset;

					target.classList.remove('lazy');
					observer.unobserve(target);
				}
			});
		},
		{
			rootMargin: '50px',
			...options
		}
	);

	observer.observe(img);

	return () => observer.disconnect();
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Convert image to WebP if supported
 */
export function getWebPUrl(url: string): string {
	// Check if browser supports WebP
	const supportsWebP =
		document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

	if (supportsWebP && !url.endsWith('.svg')) {
		return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
	}

	return url;
}

/**
 * Image loading directive for Svelte
 * Usage: <img use:lazyImage={{ src: '/image.jpg' }} />
 */
export function lazyImage(
	node: HTMLImageElement,
	{ src, srcset }: { src: string; srcset?: string }
) {
	node.dataset.src = src;
	if (srcset) node.dataset.srcset = srcset;
	node.classList.add('lazy');

	const cleanup = lazyLoadImage(node);

	return {
		destroy: cleanup
	};
}
