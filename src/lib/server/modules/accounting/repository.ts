import { db } from '$lib/server/database';
import {
	accounts,
	journalEntries,
	journalItems,
	journals
} from '$lib/server/database/schemas/accounting';
import { eq, sql, and, desc, inArray } from 'drizzle-orm';
import type {
	NewAccount,
	Account,
	NewJournalEntry,
	JournalEntry,
	NewJournalItem,
	JournalItem,
	NewJournal,
	Journal
} from '$lib/server/database/schemas/accounting';

export class AccountingRepository {
	// --- Chart of Accounts ---
	async createAccount(data: NewAccount): Promise<Account> {
		await db.insert(accounts).values(data);
		const result = await db.select().from(accounts).where(eq(accounts.id, data.id)).limit(1);
		return result[0];
	}

	async getAccounts(companyId: string): Promise<Account[]> {
		return await db
			.select()
			.from(accounts)
			.where(eq(accounts.companyId, companyId))
			.orderBy(accounts.code);
	}

	async getAccountById(id: string): Promise<Account | undefined> {
		const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
		return result[0];
	}

	// --- Journals ---
	async createJournal(data: NewJournal): Promise<Journal> {
		await db.insert(journals).values(data);
		const result = await db.select().from(journals).where(eq(journals.id, data.id)).limit(1);
		return result[0];
	}

	async getJournals(companyId: string): Promise<Journal[]> {
		return await db.select().from(journals).where(eq(journals.companyId, companyId));
	}

	// --- Journal Entries (Double Entry Logic) ---
	async createJournalEntry(
		entry: NewJournalEntry,
		items: NewJournalItem[]
	): Promise<{ entry: JournalEntry; items: JournalItem[] }> {
		return await db.transaction(async (tx) => {
			// 1. Create Header

			await tx.insert(journalEntries).values(entry);

			// 2. Create Items (Debit/Credit lines)
			if (items.length > 0) {
				await tx.insert(journalItems).values(items);
			}

			// Return created data
			const savedEntry = await tx
				.select()
				.from(journalEntries)
				.where(eq(journalEntries.id, entry.id))
				.limit(1);
			const savedItems = await tx
				.select()
				.from(journalItems)
				.where(eq(journalItems.journalEntryId, entry.id));

			return {
				entry: savedEntry[0],
				items: savedItems
			};
		});
	}

	async getJournalEntries(companyId: string, limit = 50, offset = 0) {
		const entries = await db
			.select({
				entry: journalEntries,
				journal: journals
			})
			.from(journalEntries)
			.leftJoin(journals, eq(journalEntries.journalId, journals.id))
			.where(eq(journalEntries.companyId, companyId))
			.orderBy(desc(journalEntries.date), desc(journalEntries.createdAt))
			.limit(limit)
			.offset(offset);

		if (entries.length === 0) return [];

		const entryIds = entries.map((e) => e.entry.id);

		const items = await db
			.select({
				item: journalItems,
				account: accounts
			})
			.from(journalItems)
			.leftJoin(accounts, eq(journalItems.accountId, accounts.id))
			.where(inArray(journalItems.journalEntryId, entryIds));

		return entries.map((e) => {
			return {
				...e.entry,
				journal: e.journal,
				items: items
					.filter((i) => i.item.journalEntryId === e.entry.id)
					.map((i) => ({ ...i.item, account: i.account }))
			};
		});
	}

	// --- Reporting Helper ---
	async getAccountBalance(accountId: string, startDate?: Date, endDate?: Date): Promise<number> {
		const conditions = [eq(journalItems.accountId, accountId)];

		if (startDate) {
			conditions.push(sql`${journalItems.date} >= ${startDate}`);
		}
		if (endDate) {
			conditions.push(sql`${journalItems.date} <= ${endDate}`);
		}

		const result = await db
			.select({
				balance: sql<number>`SUM(${journalItems.debit}) - SUM(${journalItems.credit})`
			})
			.from(journalItems)

			.where(and(...conditions));

		return result[0].balance || 0;
	}

	async getAccount(id: string): Promise<Account | undefined> {
		const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
		return result[0];
	}

	async updateAccount(id: string, data: Partial<NewAccount>): Promise<void> {
		await db.update(accounts).set(data).where(eq(accounts.id, id));
	}

	async getAccountByType(companyId: string, type: Account['type']): Promise<Account | undefined> {
		const result = await db
			.select()
			.from(accounts)
			.where(and(eq(accounts.companyId, companyId), eq(accounts.type, type)))
			.limit(1);
		return result[0];
	}
}
