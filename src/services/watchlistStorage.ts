import { Watchlist } from '../types/market';

export class WatchlistStorageService {
  private dbName = 'TradingBoardDB';
  private version = 1;
  private storeName = 'watchlists';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create watchlists object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          console.log('Created watchlists object store');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  async saveWatchlists(watchlists: Watchlist[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Clear existing watchlists and save new ones
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          let pending = watchlists.length;
          
          if (pending === 0) {
            resolve();
            return;
          }

          watchlists.forEach(watchlist => {
            const putRequest = store.put(watchlist);
            
            putRequest.onsuccess = () => {
              pending--;
              if (pending === 0) {
                resolve();
              }
            };
            
            putRequest.onerror = () => {
              reject(putRequest.error);
            };
          });
        };
        
        clearRequest.onerror = () => {
          reject(clearRequest.error);
        };
      });

      console.log('Watchlists saved to IndexedDB:', watchlists.length);
    } catch (error) {
      console.error('Error saving watchlists to IndexedDB:', error);
      throw error;
    }
  }

  async loadWatchlists(): Promise<Watchlist[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise<Watchlist[]>((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const watchlists = request.result || [];
          console.log('Watchlists loaded from IndexedDB:', watchlists.length);
          resolve(watchlists);
        };
        
        request.onerror = () => {
          console.error('Error loading watchlists from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      // Return empty array if IndexedDB fails
      return [];
    }
  }

  async saveWatchlist(watchlist: Watchlist): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.put(watchlist);
        
        request.onsuccess = () => {
          console.log('Watchlist saved to IndexedDB:', watchlist.id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Error saving watchlist to IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error saving watchlist:', error);
      throw error;
    }
  }

  async deleteWatchlist(id: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('Watchlist deleted from IndexedDB:', id);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Error deleting watchlist from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      throw error;
    }
  }

  async getDefaultWatchlists(): Promise<Watchlist[]> {
    // Return default watchlists if IndexedDB is empty
    const now = new Date();
    return [
      {
        id: 'default',
        name: 'My Watchlist',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'],
        pinnedSymbols: ['AAPL'], // AAPL is pinned by default
        createdAt: now,
        updatedAt: now,
        isDefault: true
      },
      {
        id: 'volatility',
        name: 'High Volatility',
        symbols: ['GME', 'AMC', 'PLTR', 'ROKU'],
        pinnedSymbols: [],
        createdAt: now,
        updatedAt: now,
        isDefault: true
      }
    ];
  }
}

export const watchlistStorage = new WatchlistStorageService(); 