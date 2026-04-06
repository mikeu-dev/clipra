// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInterpolation(content: any) {
	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		t: (key: string, params: Record<string, any> = {}) => {
			let text = content[key] || key;
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
			});
			return text;
		}
	};
}
