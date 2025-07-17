import React, { useState } from "react";
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useMarketStore } from "../store/marketStore";
import { Stock } from "../types/market";
import clsx from "clsx";

const Watchlist: React.FC = () => {
  const {
    stocks,
    watchlists,
    activeWatchlist,
    selectedSymbol,
    isConnected,
    dataSource,
    setActiveWatchlist,
    setSelectedSymbol,
    addToWatchlist,
    removeFromWatchlist,
  } = useMarketStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [newSymbol, setNewSymbol] = useState("");

  const activeWatchlistData = watchlists.find((w) => w.id === activeWatchlist);
  const watchlistSymbols = activeWatchlistData?.symbols || [];

  const filteredStocks = watchlistSymbols
    .map((symbol) => stocks[symbol])
    .filter(
      (stock) =>
        stock && stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;
  const formatChangePercent = (change: number) =>
    `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedSymbol(symbol === selectedSymbol ? null : symbol);
  };

  const handleAddSymbol = () => {
    if (newSymbol.trim() && activeWatchlist) {
      const symbol = newSymbol.trim().toUpperCase();
      addToWatchlist(activeWatchlist, symbol);
      setNewSymbol("");
    }
  };

  const handleRemoveSymbol = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWatchlist) {
      removeFromWatchlist(activeWatchlist, symbol);
    }
  };

  const getPriceColorClass = (change: number) => {
    if (change > 0) return "text-chart-green";
    if (change < 0) return "text-chart-red";
    return "text-trading-text";
  };

  return (
    <div className="trading-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-trading-border">
        <h2 className="text-lg font-semibold mb-3">Watchlist</h2>

        {/* Watchlist Tabs */}
        <div className="flex space-x-1 mb-3">
          {watchlists.map((watchlist) => (
            <button
              key={watchlist.id}
              onClick={() => setActiveWatchlist(watchlist.id)}
              className={clsx(
                "px-3 py-1 text-xs rounded transition-colors",
                activeWatchlist === watchlist.id
                  ? "bg-trading-accent text-white"
                  : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
              )}
            >
              {watchlist.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-trading-text-muted" />
          <input
            type="text"
            placeholder="Search symbols..."
            className="trading-input pl-10 w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Symbol */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Add symbol"
            className="trading-input flex-1 text-sm"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSymbol()}
          />
          <button
            onClick={handleAddSymbol}
            className="trading-button-primary p-2"
            disabled={!newSymbol.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!isConnected && dataSource === "fallback" ? (
          <div className="p-4 text-center">
            <div className="text-trading-danger mb-2">⚠️ Data Unavailable</div>
            <div className="text-sm text-trading-text-muted">
              Polygon.io API error. Market data service is temporarily
              unavailable.
            </div>
            <div className="text-xs text-trading-text-muted mt-2">
              Please verify your API key or check your plan limits.
            </div>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-4 text-center text-trading-text-muted">
            {searchTerm ? "No matching symbols" : "No symbols in watchlist"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleStockSelect(stock.symbol)}
                className={clsx(
                  "p-3 rounded cursor-pointer transition-all duration-200 border",
                  selectedSymbol === stock.symbol
                    ? "bg-trading-accent/20 border-trading-accent"
                    : "bg-trading-bg border-transparent hover:bg-trading-surface"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm">
                      {stock.symbol}
                    </span>
                    <button
                      onClick={(e) => handleRemoveSymbol(stock.symbol, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-trading-danger transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    {stock.change > 0 ? (
                      <TrendingUp className="w-3 h-3 text-chart-green" />
                    ) : stock.change < 0 ? (
                      <TrendingDown className="w-3 h-3 text-chart-red" />
                    ) : null}
                    <span
                      className={clsx(
                        "text-sm font-mono",
                        getPriceColorClass(stock.change)
                      )}
                    >
                      {formatPrice(stock.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-trading-text-muted truncate">
                    {stock.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={clsx(
                        "font-mono",
                        getPriceColorClass(stock.change)
                      )}
                    >
                      {formatChange(stock.change)}
                    </span>
                    <span
                      className={clsx(
                        "font-mono",
                        getPriceColorClass(stock.change)
                      )}
                    >
                      ({formatChangePercent(stock.changePercent)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-trading-text-muted">
                  <span>Vol: {formatVolume(stock.volume)}</span>
                  {stock.bid && stock.ask && (
                    <span>
                      Bid/Ask: {formatPrice(stock.bid)}/{formatPrice(stock.ask)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
