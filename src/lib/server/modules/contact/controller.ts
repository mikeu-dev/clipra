// src/lib/server/controllers/contact.controller.ts
import { BaseController } from '$lib/server/core/base.controller';
import { ContactService } from './service';
import type * as table from '$lib/server/database/schemas';

export class ContactController extends BaseController<table.Contact, table.NewContact> {
	constructor(service = new ContactService()) {
		super(service);
	}
}
