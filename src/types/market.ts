export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid?: number;
  ask?: number;
  lastUpdated: Date;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  timestamp: Date;
}

export interface ChartData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  values: Array<{
    timestamp: Date;
    value: number;
  }>;
  color: string;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
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