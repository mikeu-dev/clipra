// src/lib/server/repositories/contact.repository.ts
import * as table from '$lib/server/database/schemas';
import { BaseRepository } from '$lib/server/core/base.repository';
import type { IContactRepository } from './interfaces/IContactRepository';

export class ContactRepository
	extends BaseRepository<typeof table.contacts, table.Contact, table.NewContact>
	implements IContactRepository
{
	constructor() {
		super(table.contacts);
	}
}
