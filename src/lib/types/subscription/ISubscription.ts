export interface Subscription {
	id: string;
	email: string;
	isSubscribed: boolean;
	unsubscribeToken: string;
	unsubscribedAt: string;
	createdAt: string;
	[key: string]: unknown;
}
