import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Watchlist
} from '../types/market';
import { watchlistStorage } from '../services/watchlistStorage';

interface MarketStore {
  // Core State
  selectedSymbol: string | null;
  
  // Watchlists
  watchlists: Watchlist[];
  activeWatchlist: string | null;
  
  // Actions
  setSelectedSymbol: (symbol: string | null) => void;
  
  initializeWatchlists: () => Promise<void>;
  addWatchlist: (watchlist: Watchlist) => void;
  removeWatchlist: (id: string) => void;
  updateWatchlist: (id: string, update: Partial<Watchlist>) => void;
  setActiveWatchlist: (id: string | null) => void;
  addToWatchlist: (watchlistId: string, symbol: string) => void;
  removeFromWatchlist: (watchlistId: string, symbol: string) => void;
  
  // Enhanced watchlist management
  createWatchlist: (name: string) => void;
  renameWatchlist: (id: string, newName: string) => void;
  duplicateWatchlist: (id: string, newName: string) => void;
  copySymbolBetweenWatchlists: (symbol: string, fromId: string, toId: string) => void;
  pinSymbol: (watchlistId: string, symbol: string) => void;
  unpinSymbol: (watchlistId: string, symbol: string) => void;
  reorderSymbols: (watchlistId: string, symbols: string[]) => void;
}

export const useMarketStore = create<MarketStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    selectedSymbol: null,
    
    watchlists: [],
    activeWatchlist: 'default',
    
    // Actions
    setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
    
    initializeWatchlists: async () => {
      try {
        let watchlists = await watchlistStorage.loadWatchlists();
        
        // If no watchlists found in IndexedDB, use defaults
        if (watchlists.length === 0) {
          watchlists = await watchlistStorage.getDefaultWatchlists();
          await watchlistStorage.saveWatchlists(watchlists);
        }
        
        set({ 
          watchlists,
          activeWatchlist: watchlists.length > 0 ? watchlists[0].id : null
        });
      } catch (error) {
        console.error('Error initializing watchlists:', error);
        // Fall back to default watchlists
        const defaultWatchlists = await watchlistStorage.getDefaultWatchlists();
        set({ 
          watchlists: defaultWatchlists,
          activeWatchlist: defaultWatchlists.length > 0 ? defaultWatchlists[0].id : null
        });
      }
    },
    
    addWatchlist: (watchlist) => {
      set((state) => ({
        watchlists: [...state.watchlists, watchlist]
      }));
      
      // Persist to IndexedDB
      watchlistStorage.saveWatchlist(watchlist).catch(error => {
        console.error('Error saving watchlist to IndexedDB:', error);
      });
    },
    
    removeWatchlist: (id) => {
      set((state) => ({
        watchlists: state.watchlists.filter(w => w.id !== id),
        activeWatchlist: state.activeWatchlist === id ? null : state.activeWatchlist
      }));
      
      // Persist to IndexedDB
      watchlistStorage.deleteWatchlist(id).catch(error => {
        console.error('Error deleting watchlist from IndexedDB:', error);
      });
    },
    
    updateWatchlist: (id, update) => {
      const state = get();
      const updatedWatchlist = state.watchlists.find(w => w.id === id);
      if (updatedWatchlist) {
        const newWatchlist = { ...updatedWatchlist, ...update };
        
        set((state) => ({
          watchlists: state.watchlists.map(w => 
            w.id === id ? newWatchlist : w
          )
        }));
        
        // Persist to IndexedDB
        watchlistStorage.saveWatchlist(newWatchlist).catch(error => {
          console.error('Error updating watchlist in IndexedDB:', error);
        });
      }
    },
    
    setActiveWatchlist: (id) => set({ activeWatchlist: id }),
    
    addToWatchlist: (watchlistId, symbol) => {
      const state = get();
      const watchlist = state.watchlists.find(w => w.id === watchlistId);
      
      if (watchlist && !watchlist.symbols.includes(symbol)) {
        const updatedWatchlist = { ...watchlist, symbols: [...watchlist.symbols, symbol] };
        
        set((state) => ({
          watchlists: state.watchlists.map(w => 
            w.id === watchlistId ? updatedWatchlist : w
          )
        }));
        
        // Persist to IndexedDB
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error saving watchlist to IndexedDB:', error);
        });
      }
    },
    
    removeFromWatchlist: (watchlistId, symbol) => {
      const state = get();
      const watchlist = state.watchlists.find(w => w.id === watchlistId);
      
      if (watchlist) {
        const updatedWatchlist = { ...watchlist, symbols: watchlist.symbols.filter(s => s !== symbol) };
        
        set((state) => ({
          watchlists: state.watchlists.map(w => 
            w.id === watchlistId ? updatedWatchlist : w
          )
        }));
        
        // Persist to IndexedDB
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error saving watchlist to IndexedDB:', error);
        });
      }
    },
    
    // Enhanced watchlist management
    createWatchlist: (name) => {
      const newWatchlist: Watchlist = {
        id: `watchlist-${Date.now()}`,
        name: name,
        symbols: [],
        pinnedSymbols: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      set((state) => ({
        watchlists: [...state.watchlists, newWatchlist]
      }));
      watchlistStorage.saveWatchlist(newWatchlist).catch(error => {
        console.error('Error saving new watchlist to IndexedDB:', error);
      });
    },
    
    renameWatchlist: (id, newName) => {
      set((state) => ({
        watchlists: state.watchlists.map(w => 
          w.id === id ? { ...w, name: newName, updatedAt: new Date() } : w
        )
      }));
      const updatedWatchlist = get().watchlists.find(w => w.id === id);
      if (updatedWatchlist) {
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error renaming watchlist in IndexedDB:', error);
        });
      }
    },
    
    duplicateWatchlist: (id, newName) => {
      const originalWatchlist = get().watchlists.find(w => w.id === id);
      if (originalWatchlist) {
        const newWatchlist: Watchlist = {
          id: `watchlist-${Date.now()}`,
          name: newName,
          symbols: [...originalWatchlist.symbols],
          pinnedSymbols: [...originalWatchlist.pinnedSymbols],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist]
        }));
        watchlistStorage.saveWatchlist(newWatchlist).catch(error => {
          console.error('Error duplicating watchlist in IndexedDB:', error);
        });
      }
    },
    
    copySymbolBetweenWatchlists: (symbol, fromId, toId) => {
      const state = get();
      const fromWatchlist = state.watchlists.find(w => w.id === fromId);
      const toWatchlist = state.watchlists.find(w => w.id === toId);

      if (fromWatchlist && toWatchlist && !toWatchlist.symbols.includes(symbol)) {
        const isSymbolPinned = (fromWatchlist.pinnedSymbols || []).includes(symbol);
        
        const updatedToWatchlist: Watchlist = {
          ...toWatchlist,
          symbols: [...toWatchlist.symbols, symbol],
          pinnedSymbols: isSymbolPinned ? [...(toWatchlist.pinnedSymbols || []), symbol] : (toWatchlist.pinnedSymbols || []),
          updatedAt: new Date()
        };

        set((state) => ({
          watchlists: state.watchlists.map(w => 
            w.id === toId ? updatedToWatchlist : w
          )
        }));

        watchlistStorage.saveWatchlist(updatedToWatchlist).catch(error => {
          console.error('Error copying symbol to watchlist in IndexedDB:', error);
        });
      }
    },
    
    pinSymbol: (watchlistId, symbol) => {
      set((state) => ({
        watchlists: state.watchlists.map(w => 
          w.id === watchlistId ? { 
            ...w, 
            pinnedSymbols: (w.pinnedSymbols || []).includes(symbol) ? (w.pinnedSymbols || []) : [...(w.pinnedSymbols || []), symbol],
            updatedAt: new Date()
          } : w
        )
      }));
      const updatedWatchlist = get().watchlists.find(w => w.id === watchlistId);
      if (updatedWatchlist) {
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error pinning symbol in IndexedDB:', error);
        });
      }
    },
    
    unpinSymbol: (watchlistId, symbol) => {
      set((state) => ({
        watchlists: state.watchlists.map(w => 
          w.id === watchlistId ? { 
            ...w, 
            pinnedSymbols: (w.pinnedSymbols || []).filter(s => s !== symbol),
            updatedAt: new Date()
          } : w
        )
      }));
      const updatedWatchlist = get().watchlists.find(w => w.id === watchlistId);
      if (updatedWatchlist) {
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error unpinning symbol in IndexedDB:', error);
        });
      }
    },
    
    reorderSymbols: (watchlistId, symbols) => {
      set((state) => ({
        watchlists: state.watchlists.map(w => 
          w.id === watchlistId ? { ...w, symbols: symbols, updatedAt: new Date() } : w
        )
      }));
      const updatedWatchlist = get().watchlists.find(w => w.id === watchlistId);
      if (updatedWatchlist) {
        watchlistStorage.saveWatchlist(updatedWatchlist).catch(error => {
          console.error('Error reordering symbols in IndexedDB:', error);
        });
      }
    }
  }))
); 