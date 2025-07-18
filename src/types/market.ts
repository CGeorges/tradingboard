export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  pinnedSymbols: string[]; // Symbols pinned to the top
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean; // Indicates if this is a system-provided watchlist
}

export interface MarketAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  price: number;
  type: 'price' | 'volume';
  isActive: boolean;
  createdAt: Date;
}

export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface ChartSettings {
  timeframe: TimeFrame;
  indicators: string[];
  showVolume: boolean;
  showGrid: boolean;
  theme: 'dark' | 'light';
} 