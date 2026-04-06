import { AccountingRepository } from './repository';
import type {
	NewJournalEntry,
	NewJournalItem,
	NewAccount,
	Account
} from '$lib/server/database/schemas/accounting';
import { v4 as uuidv4 } from 'uuid';

export class AccountingService {
	private repo: AccountingRepository;

	constructor() {
		this.repo = new AccountingRepository();
	}

	async createEntry(
		entryData: Omit<NewJournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
		itemsData: Omit<NewJournalItem, 'id' | 'journalEntryId' | 'createdAt' | 'companyId' | 'date'>[]
	) {
		// 1. Validate Double Entry (Debit == Credit)
		const totalDebit = itemsData.reduce((sum, item) => sum + Number(item.debit || 0), 0);
		const totalCredit = itemsData.reduce((sum, item) => sum + Number(item.credit || 0), 0);

		if (Math.abs(totalDebit - totalCredit) > 0.01) {
			// Floating point tolerance
			throw new Error(
				`Journal Entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
			);
		}

		// 2. Prepare Data
		const entryId = uuidv4();
		const entry: NewJournalEntry = {
			...entryData,
			id: entryId
		};

		const items: NewJournalItem[] = itemsData.map((item) => ({
			...item,
			id: uuidv4(),
			journalEntryId: entryId,
			companyId: entryData.companyId, // Inherit company
			date: entryData.date // Inherit date
		}));

		// 3. Persist
		return await this.repo.createJournalEntry(entry, items);
	}

	async getGL(companyId: string) {
		return await this.repo.getJournalEntries(companyId);
	}

	async getAccountBalance(accountId: string) {
		return await this.repo.getAccountBalance(accountId);
	}

	async getAccounts(companyId: string) {
		return await this.repo.getAccounts(companyId);
	}

	async getAccount(id: string) {
		return await this.repo.getAccount(id);
	}

	async updateAccount(id: string, data: Partial<NewAccount>) {
		return await this.repo.updateAccount(id, data);
	}

	async getAccountByType(companyId: string, type: Account['type']) {
		return await this.repo.getAccountByType(companyId, type);
	}

	async getJournals(companyId: string) {
		return await this.repo.getJournals(companyId);
	}
}
