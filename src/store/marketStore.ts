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
    
    watchlists: [
      {
        id: 'default',
        name: 'My Watchlist',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'],
        type: 'custom'
      },
      {
        id: 'volatility',
        name: 'High Volatility',
        symbols: ['GME', 'AMC', 'PLTR', 'ROKU'],
        type: 'volatility'
      }
    ],
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
    
    addWatchlist: (watchlist) => set((state) => ({
      watchlists: [...state.watchlists, watchlist]
    })),
    
    removeWatchlist: (id) => set((state) => ({
      watchlists: state.watchlists.filter(w => w.id !== id),
      activeWatchlist: state.activeWatchlist === id ? null : state.activeWatchlist
    })),
    
    updateWatchlist: (id, update) => set((state) => ({
      watchlists: state.watchlists.map(w => 
        w.id === id ? { ...w, ...update } : w
      )
    })),
    
    setActiveWatchlist: (id) => set({ activeWatchlist: id }),
    
    addToWatchlist: (watchlistId, symbol) => set((state) => ({
      watchlists: state.watchlists.map(w => 
        w.id === watchlistId && !w.symbols.includes(symbol)
          ? { ...w, symbols: [...w.symbols, symbol] }
          : w
      )
    })),
    
    removeFromWatchlist: (watchlistId, symbol) => set((state) => ({
      watchlists: state.watchlists.map(w => 
        w.id === watchlistId
          ? { ...w, symbols: w.symbols.filter(s => s !== symbol) }
          : w
      )
    })),
    
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