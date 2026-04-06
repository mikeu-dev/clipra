import { encodeBase32LowerCase } from '@oslojs/encoding';
export function generateId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
