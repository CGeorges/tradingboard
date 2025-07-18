export class MarketDataService {
  constructor() {
    console.log('🔄 MarketDataService initialized - using TradingView data widgets');
    console.log('Market data service ready - TradingView widgets provide real-time quotes');
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
    console.log('Market data service disconnected');
  }
}

// Singleton instance
export const marketDataService = new MarketDataService(); 