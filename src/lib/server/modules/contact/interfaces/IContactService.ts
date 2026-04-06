// src/lib/server/services/interfaces/IContactService.ts
import type { IService } from '$lib/server/core/interfaces/IService';
import type * as table from '$lib/server/database/schemas';

export type IContactService = IService<table.Contact, table.NewContact, table.Contact>;
