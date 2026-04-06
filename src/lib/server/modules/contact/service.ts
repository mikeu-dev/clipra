// src/lib/server/services/contact.service.ts
import type * as table from '$lib/server/database/schemas';
import { BaseService } from '$lib/server/core/base.service';
import { ContactRepository } from './repository';
import type { IContactService } from './interfaces/IContactService';

export class ContactService
	extends BaseService<table.Contact, table.NewContact>
	implements IContactService
{
	constructor(repository = new ContactRepository()) {
		super(repository);
	}
}
