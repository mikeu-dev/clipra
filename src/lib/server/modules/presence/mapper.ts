import { BaseMapper } from '../../core/base.mapper';
import type * as table from '$lib/server/database/schemas';

export class PresenceMapper extends BaseMapper<table.Presence, unknown> {
	toDTO(data: table.Presence): unknown {
		return {
			...data
			// Add any custom mapping here if needed, or refine generic type
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	toEntity(_data: unknown): table.Presence {
		throw new Error('Method not implemented.');
	}
}
