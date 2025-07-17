import React, { useState } from "react";
import { Plus, Search, Minus } from "lucide-react";
import { useMarketStore } from "../store/marketStore";
import SingleTicker from "./SingleTicker";
import clsx from "clsx";

const Watchlist: React.FC = () => {
  const {
    watchlists,
    activeWatchlist,
    selectedSymbol,
    setActiveWatchlist,
    setSelectedSymbol,
    addToWatchlist,
    removeFromWatchlist,
  } = useMarketStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [newSymbol, setNewSymbol] = useState("");

  const activeWatchlistData = watchlists.find((w) => w.id === activeWatchlist);
  const watchlistSymbols = activeWatchlistData?.symbols || [];

  const filteredSymbols = watchlistSymbols.filter((symbol) =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTickerClick = (symbol: string) => {
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

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredSymbols.length === 0 ? (
          <div className="p-4 text-center text-trading-text-muted">
            {searchTerm ? "No matching symbols" : "No symbols in watchlist"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredSymbols.map((symbol) => (
              <div
                key={symbol}
                className={clsx(
                  "relative group rounded border transition-all duration-200",
                  selectedSymbol === symbol
                    ? "bg-trading-accent/20 border-trading-accent"
                    : "bg-trading-bg border-transparent hover:bg-trading-surface"
                )}
              >
                <button
                  onClick={(e) => handleRemoveSymbol(symbol, e)}
                  className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 hover:text-trading-danger transition-all bg-trading-bg/80 rounded p-1"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <SingleTicker
                  symbol={symbol}
                  onClick={handleTickerClick}
                  colorTheme="dark"
                  isTransparent={true}
                  width="100%"
                  height={100}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
