import { Watchlist } from '../types/market';

export class WatchlistStorageService {
  private apiBaseUrl: string;

  constructor() {
    // Use environment variable or default to backend API URL
    // In production (Docker), use the backend service name
    // In development, use localhost
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    console.log('🔗 API Base URL:', this.apiBaseUrl);
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async saveWatchlists(watchlists: Watchlist[]): Promise<void> {
    try {
      await this.fetchApi('/watchlists/bulk', {
        method: 'POST',
        body: JSON.stringify({ watchlists }),
      });

      console.log('✅ Watchlists saved via API:', watchlists.length);
    } catch (error) {
      console.error('❌ Error saving watchlists via API:', error);
      throw error;
    }
  }

  async loadWatchlists(): Promise<Watchlist[]> {
    try {
      const watchlists = await this.fetchApi<Watchlist[]>('/watchlists');

      // Convert date strings back to Date objects
      const processedWatchlists = watchlists.map(watchlist => ({
        ...watchlist,
        createdAt: new Date(watchlist.createdAt),
        updatedAt: new Date(watchlist.updatedAt),
      }));

      console.log('✅ Watchlists loaded via API:', processedWatchlists.length);
      return processedWatchlists;
    } catch (error) {
      console.error('❌ Error loading watchlists via API:', error);
      // Return default watchlists if API fails
      return this.getDefaultWatchlists();
    }
  }

  async saveWatchlist(watchlist: Watchlist): Promise<void> {
    try {
      // Try to update first, if not found, create new
      try {
        await this.fetchApi(`/watchlists/${watchlist.id}`, {
          method: 'PUT',
          body: JSON.stringify(watchlist),
        });
        console.log('✅ Watchlist updated via API:', watchlist.id);
      } catch (error) {
        // If update fails (404), create new watchlist
        if (error instanceof Error && error.message.includes('404')) {
          await this.fetchApi('/watchlists', {
            method: 'POST',
            body: JSON.stringify(watchlist),
          });
          console.log('✅ Watchlist created via API:', watchlist.id);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Error saving watchlist via API:', error);
      throw error;
    }
  }

  async deleteWatchlist(id: string): Promise<void> {
    try {
      await this.fetchApi(`/watchlists/${id}`, {
        method: 'DELETE',
      });

      console.log('✅ Watchlist deleted via API:', id);
    } catch (error) {
      console.error('❌ Error deleting watchlist via API:', error);
      throw error;
    }
  }

  async getDefaultWatchlists(): Promise<Watchlist[]> {
    // Return default watchlists as fallback
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