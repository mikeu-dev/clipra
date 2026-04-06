// src/lib/hooks/useInterpolation.ts

interface LocaleContent {
	[key: string]: string | LocaleContent;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interpolate(template: string, values: Record<string, any>): string {
	return template.replace(/{(.*?)}/g, (_, key) =>
		values?.[key] !== undefined ? String(values[key]) : ''
	);
}

export function useInterpolation<T extends LocaleContent>(data: T) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const translate = (key: string, vars?: Record<string, any>): string => {
		const parts = key.split('.');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let result: any = data;

		for (const part of parts) {
			if (result && typeof result === 'object') {
				result = result[part];
			} else {
				console.warn(`Part '${part}' tidak ditemukan dalam key '${key}'.`);
				return key;
			}
		}

		if (typeof result === 'string') {
			return vars ? interpolate(result, vars) : result;
		}

		console.warn(`Terjemahan untuk key '${key}' tidak ditemukan.`);
		return key;
	};

	return { t: translate };
}
