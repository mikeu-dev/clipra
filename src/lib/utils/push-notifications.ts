// Push notification utilities - no storage needed
import { env } from '$env/dynamic/public';
// This should be replaced with the actual key from env/server injection or a proper config
const PUBLIC_VAPID_KEY = env.PUBLIC_VAPID_KEY;

export interface PushNotificationState {
	isSupported: boolean;
	permission: NotificationPermission;
	subscription: PushSubscription | null;
}

export async function checkPushSupport(): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if (!(await checkPushSupport())) return 'denied';

	const permission = await Notification.requestPermission();
	return permission;
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
	if (!(await checkPushSupport())) return null;

	const registration = await navigator.serviceWorker.ready;
	let subscription = await registration.pushManager.getSubscription();

	if (!subscription) {
		if (!PUBLIC_VAPID_KEY) {
			console.error('Public VAPID key is missing');
			return null;
		}

		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as any
		});

		// Send subscription to backend
		await saveSubscriptionToServer(subscription);
	}

	return subscription;
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
	if (!(await checkPushSupport())) return false;

	const registration = await navigator.serviceWorker.ready;
	const subscription = await registration.pushManager.getSubscription();

	if (subscription) {
		await subscription.unsubscribe();
		// Notify backend to remove subscription
		await removeSubscriptionFromServer(subscription.endpoint);
		return true;
	}

	return false;
}

async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
	try {
		await fetch('/api/notifications/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(subscription)
		});
	} catch (error) {
		console.error('Failed to save subscription to server:', error);
	}
}

async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
	try {
		await fetch('/api/notifications/unsubscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ endpoint })
		});
	} catch (error) {
		console.error('Failed to remove subscription from server:', error);
	}
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
