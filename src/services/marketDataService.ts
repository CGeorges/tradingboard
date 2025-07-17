import { ChartData } from '../types/market';
import { useMarketStore } from '../store/marketStore';

export class MarketDataService {
  private dataCache = new Map<string, any>();
  private lastFetchTime = new Map<string, number>();

  constructor() {
    console.log('🔄 MarketDataService initialized - using TradingView data widgets');
    this.initializeService();
  }

  private initializeService() {
    // TradingView widgets handle real-time data automatically
    // We only need to handle chart data requests
    console.log('Market data service ready - TradingView widgets provide real-time quotes');
    useMarketStore.getState().setConnectionStatus(true);
    useMarketStore.getState().setDataSource('real');
  }

  // Simplified historical data method for charts
  public async getHistoricalData(symbol: string, timeframe: string): Promise<ChartData[]> {
    // Check cache first
    const cacheKey = `historical_${symbol}_${timeframe}`;
    const now = Date.now();
    const lastFetch = this.lastFetchTime.get(cacheKey) || 0;
    
    // Cache historical data for 5 minutes
    if (now - lastFetch < 300000 && this.dataCache.has(cacheKey)) {
      console.log(`Using cached historical data for ${symbol} ${timeframe}`);
      return this.dataCache.get(cacheKey);
    }

    // Generate mock historical data for demonstration
    // In production, this could use a different API or TradingView's chart data
    const chartData = this.generateMockHistoricalData(symbol, timeframe);
    
    // Cache the result
    this.dataCache.set(cacheKey, chartData);
    this.lastFetchTime.set(cacheKey, now);
    
    console.log(`Generated ${chartData.length} historical data points for ${symbol}`);
    return chartData;
  }

  private generateMockHistoricalData(symbol: string, timeframe: string): ChartData[] {
    const data: ChartData[] = [];
    
    // Base prices for different symbols
    const basePrices: Record<string, number> = {
      'AAPL': 225.47,
      'MSFT': 425.12,
      'GOOGL': 165.23,
      'TSLA': 262.84,
      'AMZN': 175.68
    };
    
    const basePrice = basePrices[symbol] || 100;
    
    // Different number of points based on timeframe
    const pointsMap: Record<string, number> = {
      '1m': 390,  // 6.5 hours of 1-minute data
      '5m': 156,  // 13 hours of 5-minute data
      '15m': 96,  // 24 hours of 15-minute data
      '30m': 48,  // 24 hours of 30-minute data
      '1h': 168,  // 7 days of hourly data
      '4h': 42,   // 7 days of 4-hour data
      '1d': 252   // 1 year of daily data
    };
    
    const points = pointsMap[timeframe] || 100;
    let currentPrice = basePrice * 0.95; // Start 5% lower
    const now = new Date();
    
    // Different intervals based on timeframe
    const intervalMap: Record<string, number> = {
      '1m': 60000,         // 1 minute
      '5m': 300000,        // 5 minutes
      '15m': 900000,       // 15 minutes
      '30m': 1800000,      // 30 minutes
      '1h': 3600000,       // 1 hour
      '4h': 14400000,      // 4 hours
      '1d': 86400000       // 1 day
    };
    
    const interval = intervalMap[timeframe] || 60000;
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval));
      
      // Generate realistic price movement
      const volatility = symbol === 'TSLA' ? 0.03 : 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      currentPrice = Math.max(basePrice * 0.5, currentPrice * (1 + change));
      
      const open = currentPrice;
      const close = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
      
      currentPrice = close;
    }
    
    return data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Utility methods for date formatting
  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.getDateString(date);
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Legacy methods for compatibility (no-op since TradingView handles subscriptions)
  public subscribe(symbol: string) {
    // TradingView widgets handle their own subscriptions
    console.log(`Symbol ${symbol} tracked by TradingView widget`);
  }

  public unsubscribe(symbol: string) {
    // TradingView widgets handle their own subscriptions
    console.log(`Symbol ${symbol} untracked`);
  }

  public disconnect() {
    // Clean up any remaining resources
    this.dataCache.clear();
    this.lastFetchTime.clear();
    console.log('Market data service disconnected');
  }
}

// Singleton instance
export const marketDataService = new MarketDataService(); 