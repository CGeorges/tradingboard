import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Stock, 
  Quote, 
  ChartData, 
  NewsItem, 
  Watchlist, 
  MarketAlert,
  ChartSettings,
  TimeFrame 
} from '../types/market';
import { watchlistStorage } from '../services/watchlistStorage';

interface MarketStore {
  // Market Data
  stocks: Record<string, Stock>;
  quotes: Record<string, Quote>;
  chartData: Record<string, ChartData[]>;
  selectedSymbol: string | null;
  
  // News & Alerts
  news: NewsItem[];
  alerts: MarketAlert[];
  
  // Watchlists
  watchlists: Watchlist[];
  activeWatchlist: string | null;
  
  // Chart Settings
  chartSettings: ChartSettings;
  
  // UI State
  isConnected: boolean;
  lastUpdate: Date | null;
  dataSource: 'real' | 'fallback';
  selectedNewsFilter: string;
  
  // Actions
  updateStock: (symbol: string, data: Partial<Stock>) => void;
  updateQuote: (symbol: string, quote: Quote) => void;
  addChartData: (symbol: string, data: ChartData[]) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  
  addNews: (newsItem: NewsItem) => void;
  updateNews: (id: string, update: Partial<NewsItem>) => void;
  setNewsFilter: (filter: string) => void;
  
  initializeWatchlists: () => Promise<void>;
  addWatchlist: (watchlist: Watchlist) => void;
  removeWatchlist: (id: string) => void;
  updateWatchlist: (id: string, update: Partial<Watchlist>) => void;
  setActiveWatchlist: (id: string | null) => void;
  addToWatchlist: (watchlistId: string, symbol: string) => void;
  removeFromWatchlist: (watchlistId: string, symbol: string) => void;
  
  addAlert: (alert: MarketAlert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
  setTimeframe: (timeframe: TimeFrame) => void;
  
  setConnectionStatus: (connected: boolean) => void;
  setDataSource: (source: 'real' | 'fallback') => void;
}

export const useMarketStore = create<MarketStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    stocks: {},
    quotes: {},
    chartData: {},
    selectedSymbol: null,
    
    news: [],
    alerts: [],
    
    watchlists: [],
    activeWatchlist: 'default',
    
    chartSettings: {
      timeframe: '1d',
      indicators: ['VWAP', 'EMA20'],
      showVolume: true,
      showGrid: true,
      theme: 'dark'
    },
    
    isConnected: false,
    lastUpdate: null,
    dataSource: 'real',
    selectedNewsFilter: 'all',
    
    // Actions
    updateStock: (symbol, data) => set((state) => ({
      stocks: {
        ...state.stocks,
        [symbol]: {
          ...state.stocks[symbol],
          ...data,
          lastUpdated: new Date()
        }
      },
      lastUpdate: new Date()
    })),
    
    updateQuote: (symbol, quote) => set((state) => ({
      quotes: {
        ...state.quotes,
        [symbol]: quote
      },
      stocks: {
        ...state.stocks,
        [symbol]: {
          ...state.stocks[symbol],
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          bid: quote.bid,
          ask: quote.ask,
          lastUpdated: quote.timestamp
        }
      },
      lastUpdate: new Date()
    })),
    
    addChartData: (symbol, data) => set((state) => ({
      chartData: {
        ...state.chartData,
        [symbol]: data
      }
    })),
    
    setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
    
    addNews: (newsItem) => set((state) => ({
      news: [newsItem, ...state.news].slice(0, 100) // Keep last 100 items
    })),
    
    updateNews: (id, update) => set((state) => ({
      news: state.news.map(item => 
        item.id === id ? { ...item, ...update } : item
      )
    })),
    
    setNewsFilter: (filter) => set({ selectedNewsFilter: filter }),
    
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
    
    addAlert: (alert) => set((state) => ({
      alerts: [...state.alerts, alert]
    })),
    
    removeAlert: (id) => set((state) => ({
      alerts: state.alerts.filter(a => a.id !== id)
    })),
    
    toggleAlert: (id) => set((state) => ({
      alerts: state.alerts.map(a => 
        a.id === id ? { ...a, active: !a.active } : a
      )
    })),
    
    updateChartSettings: (settings) => set((state) => ({
      chartSettings: { ...state.chartSettings, ...settings }
    })),
    
    setTimeframe: (timeframe) => set((state) => ({
      chartSettings: { ...state.chartSettings, timeframe }
    })),
    
    setConnectionStatus: (connected) => set({ 
      isConnected: connected,
      lastUpdate: connected ? new Date() : get().lastUpdate
    }),
    
    setDataSource: (source) => set({
      dataSource: source
    })
  }))
); 