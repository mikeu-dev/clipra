import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
	return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, hash);
}

/**
 * Check if a string looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
 */
export function isBcryptHash(value: string): boolean {
	return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
}
