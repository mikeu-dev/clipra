import type { ParamMatcher } from '@sveltejs/kit';

const allowed = ['id', 'en'] as const;
type AllowedParam = (typeof allowed)[number];

export const match: ParamMatcher = (param): param is AllowedParam =>
	allowed.includes(param as AllowedParam);
