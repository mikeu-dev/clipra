// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				role: {
					id: string;
					name: string;
					level: string;
				} | null;
			} | null;
			session: unknown;
			permissions: string[];
			company: {
				id: string;
				name: string;
				slug: string | null;
				themeConfig: unknown | null;
				isPublic: boolean | null;
			} | null; // For Public Compro
			activeCompany: { id: string; name: string; role: string; themeConfig: unknown | null } | null; // For Dashboard Session
		}
	}
}

export {};
