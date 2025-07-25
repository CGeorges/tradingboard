import React, { useState, useEffect } from "react";
import {
  LuPlus,
  LuSearch,
  LuMinus,
  LuEllipsis,
  LuPencil,
  LuTrash2,
  LuCopy,
  LuPin,
  LuPinOff,
  LuArrowRight,
  LuCheck,
  LuX,
} from "react-icons/lu";
import { useMarketStore } from "../store/marketStore";
import SingleTicker from "./SingleTicker";
import clsx from "clsx";

const Watchlist: React.FC = () => {
  const {
    watchlists,
    activeWatchlist,
    selectedSymbol,
    watchlistError,
    setActiveWatchlist,
    setSelectedSymbol,
    addToWatchlist,
    removeFromWatchlist,
    createWatchlist,
    renameWatchlist,
    removeWatchlist,
    duplicateWatchlist,
    pinSymbol,
    unpinSymbol,
    copySymbolBetweenWatchlists,
    clearWatchlistError,
  } = useMarketStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [showWatchlistMenu, setShowWatchlistMenu] = useState<string | null>(
    null
  );
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
  const [editingWatchlist, setEditingWatchlist] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".watchlist-menu") &&
        !target.closest(".watchlist-menu-trigger")
      ) {
        setShowWatchlistMenu(null);
        setShowMoveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeWatchlistData = watchlists.find((w) => w.id === activeWatchlist);
  const watchlistSymbols = activeWatchlistData?.symbols || [];
  const pinnedSymbols = activeWatchlistData?.pinnedSymbols || [];

  // Sort symbols with pinned ones first
  const sortedSymbols = [
    ...pinnedSymbols,
    ...watchlistSymbols.filter((symbol) => !pinnedSymbols.includes(symbol)),
  ];

  const filteredSymbols = sortedSymbols.filter((symbol) =>
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

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(newWatchlistName.trim());
      setNewWatchlistName("");
      setShowCreateForm(false);
    }
  };

  const handleRenameWatchlist = (id: string) => {
    if (editName.trim()) {
      renameWatchlist(id, editName.trim());
      setEditingWatchlist(null);
      setEditName("");
    }
  };

  const handleDeleteWatchlist = (id: string) => {
    const watchlist = watchlists.find((w) => w.id === id);
    if (watchlist && watchlists.length > 1) {
      removeWatchlist(id);
    }
    setShowWatchlistMenu(null);
  };

  const handleDuplicateWatchlist = (id: string) => {
    const watchlist = watchlists.find((w) => w.id === id);
    if (watchlist) {
      duplicateWatchlist(id, `${watchlist.name} Copy`);
    }
    setShowWatchlistMenu(null);
  };

  const handlePinToggle = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWatchlist) {
      if (pinnedSymbols.includes(symbol)) {
        unpinSymbol(activeWatchlist, symbol);
      } else {
        pinSymbol(activeWatchlist, symbol);
      }
    }
  };

  const handleMoveSymbol = (symbol: string, toWatchlistId: string) => {
    if (activeWatchlist && activeWatchlist !== toWatchlistId) {
      copySymbolBetweenWatchlists(symbol, activeWatchlist, toWatchlistId);
    }
    setShowMoveMenu(null);
  };

  const startEditing = (watchlist: { id: string; name: string }) => {
    setEditingWatchlist(watchlist.id);
    setEditName(watchlist.name);
    setShowWatchlistMenu(null);
  };

  return (
    <div className="trading-panel h-full flex flex-col">
      {/* Database Error State */}
      {watchlistError && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-trading-danger mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75A11.96 11.96 0 0112 2.704zm0 9.046h.008v.008H12V11.75z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-trading-text mb-2">
            Database Connection Error
          </h3>
          <p className="text-trading-text-muted mb-6 max-w-md">
            {watchlistError}
          </p>
          <button
            onClick={() => {
              clearWatchlistError();
              // Re-trigger initialization
              const { initializeWatchlists } = useMarketStore.getState();
              initializeWatchlists();
            }}
            className="trading-button-primary px-6 py-2"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Normal Watchlist Content */}
      {!watchlistError && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-trading-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Watchlists</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="trading-button-primary p-1.5"
                title="Create new watchlist"
              >
                <LuPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Create Watchlist Form */}
            {showCreateForm && (
              <div className="mb-3 p-3 bg-trading-surface rounded border">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Watchlist name"
                    className="trading-input flex-1 text-sm"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCreateWatchlist()
                    }
                    autoFocus
                  />
                  <button
                    onClick={handleCreateWatchlist}
                    className="trading-button-primary p-2"
                    disabled={!newWatchlistName.trim()}
                  >
                    <LuCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewWatchlistName("");
                    }}
                    className="trading-button p-2"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Watchlist Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {watchlists.map((watchlist) => (
                <div key={watchlist.id} className="relative">
                  {editingWatchlist === watchlist.id ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          handleRenameWatchlist(watchlist.id)
                        }
                        onBlur={() => handleRenameWatchlist(watchlist.id)}
                        className="trading-input text-xs px-2 py-1 w-20"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => setActiveWatchlist(watchlist.id)}
                        className={clsx(
                          "px-3 py-1 text-xs rounded-l transition-colors",
                          activeWatchlist === watchlist.id
                            ? "bg-trading-accent text-white"
                            : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
                        )}
                      >
                        {watchlist.name}
                      </button>
                      <button
                        onClick={() =>
                          setShowWatchlistMenu(
                            showWatchlistMenu === watchlist.id
                              ? null
                              : watchlist.id
                          )
                        }
                        className={clsx(
                          "px-1 py-1 text-xs rounded-r border-l border-trading-border transition-colors watchlist-menu-trigger",
                          activeWatchlist === watchlist.id
                            ? "bg-trading-accent text-white"
                            : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
                        )}
                      >
                        <LuEllipsis className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Watchlist Menu */}
                  {showWatchlistMenu === watchlist.id && (
                    <div className="absolute top-full left-0 mt-1 bg-trading-surface border border-trading-border rounded shadow-lg z-20 min-w-32 watchlist-menu">
                      <button
                        onClick={() => startEditing(watchlist)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-trading-border w-full text-left"
                      >
                        <LuPencil className="w-3 h-3" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => handleDuplicateWatchlist(watchlist.id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-trading-border w-full text-left"
                      >
                        <LuCopy className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                      {watchlists.length > 1 && (
                        <button
                          onClick={() => handleDeleteWatchlist(watchlist.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-trading-danger text-trading-danger w-full text-left"
                        >
                          <LuTrash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-trading-text-muted" />
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
                <LuPlus className="w-4 h-4" />
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
                {filteredSymbols.map((symbol) => {
                  const isPinned = pinnedSymbols.includes(symbol);
                  return (
                    <div
                      key={symbol}
                      className={clsx(
                        "relative group rounded border transition-all duration-200",
                        selectedSymbol === symbol
                          ? "bg-trading-accent/20 border-trading-accent"
                          : "bg-trading-bg border-transparent hover:bg-trading-surface",
                        isPinned && "ring-1 ring-trading-accent/50"
                      )}
                    >
                      {/* Action Buttons */}
                      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button
                          onClick={(e) => handlePinToggle(symbol, e)}
                          className={clsx(
                            "p-1 rounded transition-all bg-trading-bg/80",
                            isPinned
                              ? "text-trading-accent hover:text-trading-accent/70"
                              : "hover:text-trading-accent"
                          )}
                          title={isPinned ? "Unpin symbol" : "Pin to top"}
                        >
                          {isPinned ? (
                            <LuPinOff className="w-3 h-3" />
                          ) : (
                            <LuPin className="w-3 h-3" />
                          )}
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoveMenu(
                                showMoveMenu === symbol ? null : symbol
                              );
                            }}
                            className="p-1 rounded transition-all bg-trading-bg/80 hover:text-trading-accent watchlist-menu-trigger"
                            title="Move to another watchlist"
                          >
                            <LuArrowRight className="w-3 h-3" />
                          </button>

                          {/* Move Menu */}
                          {showMoveMenu === symbol && (
                            <div className="absolute top-full right-0 mt-1 bg-trading-surface border border-trading-border rounded shadow-lg z-30 min-w-32 watchlist-menu">
                              {watchlists
                                .filter((w) => w.id !== activeWatchlist)
                                .map((watchlist) => (
                                  <button
                                    key={watchlist.id}
                                    onClick={() =>
                                      handleMoveSymbol(symbol, watchlist.id)
                                    }
                                    className="px-3 py-2 text-sm hover:bg-trading-border w-full text-left"
                                  >
                                    {watchlist.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleRemoveSymbol(symbol, e)}
                          className="p-1 rounded transition-all bg-trading-bg/80 hover:text-trading-danger"
                          title="Remove symbol"
                        >
                          <LuMinus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Pinned Indicator */}
                      {isPinned && (
                        <div className="absolute top-1 left-1 z-10">
                          <LuPin className="w-3 h-3 text-trading-accent" />
                        </div>
                      )}

                      <SingleTicker
                        symbol={symbol}
                        onClick={handleTickerClick}
                        colorTheme="dark"
                        isTransparent={true}
                        width="100%"
                        height={100}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Watchlist;
