// PWA store using Svelte 5 runes
let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
let isInstallable = $state(false);
let isInstalled = $state(false);

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const pwa = {
	get deferredPrompt() {
		return deferredPrompt;
	},
	get isInstallable() {
		return isInstallable;
	},
	get isInstalled() {
		return isInstalled;
	},
	setDeferredPrompt(event: BeforeInstallPromptEvent | null) {
		deferredPrompt = event;
		isInstallable = event !== null;
	},
	setIsInstalled(value: boolean) {
		isInstalled = value;
	}
};

// Initialize PWA listeners
if (typeof window !== 'undefined') {
	// Listen for beforeinstallprompt event
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		pwa.setDeferredPrompt(e as BeforeInstallPromptEvent);
	});

	// Listen for appinstalled event
	window.addEventListener('appinstalled', () => {
		pwa.setIsInstalled(true);
		pwa.setDeferredPrompt(null);
	});

	// Check if already installed
	if (window.matchMedia('(display-mode: standalone)').matches) {
		pwa.setIsInstalled(true);
	}
}
