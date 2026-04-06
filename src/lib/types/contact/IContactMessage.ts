export interface ContactMessage {
	id: string;
	firstName: string;
	lastName: string;
	company: string;
	email: string;
	phoneNumber: string;
	message: string;
	agreedPolicy: boolean;
	isRead: boolean;
	isReplied: boolean;
	replyMessage: string;
	repliedAt: string;
	createdAt: string;
	[key: string]: unknown;
}
