// useAppConfig.ts

type LocaleKey = 'id' | 'en';
type ConfigField = Record<LocaleKey, string>;
type ConfigA = Record<string, ConfigField>; // Struktur A
type ConfigB = Record<LocaleKey, Record<string, string>>; // Struktur B

export function useAppConfig() {
	// Konversi dari Struktur A → B
	function toPerLocale(configA: ConfigA): ConfigB {
		const result: ConfigB = { id: {}, en: {} };
		for (const key in configA) {
			result.id[key] = configA[key].id;
			result.en[key] = configA[key].en;
		}
		return result;
	}

	// Konversi dari Struktur B → A
	function toPerField(configB: ConfigB): ConfigA {
		const result: ConfigA = {};
		const keys = Object.keys(configB.id);
		for (const key of keys) {
			result[key] = {
				id: configB.id[key],
				en: configB.en[key]
			};
		}
		return result;
	}

	return {
		toPerLocale,
		toPerField
	};
}
