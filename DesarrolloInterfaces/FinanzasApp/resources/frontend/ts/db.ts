import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Transaction } from './types';

interface FinanzasDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': string };
  };
  sync_queue: {
    key: number;
    value: {
      operation: 'CREATE' | 'UPDATE' | 'DELETE';
      payload: any;
      timestamp: number;
    };
    autoIncrement: true;
  };
}

const DB_NAME = 'finanzas-db';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<FinanzasDB>> => {
  return openDB<FinanzasDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for Transactions
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' }); // Assuming Supabase ID is preserved, or we use local ID
        store.createIndex('by-date', 'date');
      }

      // Store for Sync Queue (Offline changes)
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const dbService = {
  async getAllTransactions() {
    const db = await initDB();
    return db.getAllFromIndex('transactions', 'by-date');
  },

  async saveTransaction(transaction: Transaction) {
    const db = await initDB();
    await db.put('transactions', transaction);
  },

  async deleteTransaction(id: number) {
    const db = await initDB();
    await db.delete('transactions', id);
  },

  async addToSyncQueue(operation: 'CREATE' | 'UPDATE' | 'DELETE', payload: any) {
    const db = await initDB();
    await db.add('sync_queue', {
      operation,
      payload,
      timestamp: Date.now(),
    });
  },
  
  async getSyncQueue() {
    const db = await initDB();
    return db.getAll('sync_queue');
  },

  async clearSyncQueue(ids: number[]) {
    const db = await initDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    await Promise.all(ids.map(id => tx.store.delete(id)));
    await tx.done;
  }
};
