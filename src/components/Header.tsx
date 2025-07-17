import React from "react";
import { Activity, Wifi, WifiOff, TrendingUp } from "lucide-react";
import { useMarketStore } from "../store/marketStore";

const Header: React.FC = () => {
  const { isConnected, lastUpdate, dataSource } = useMarketStore();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <header className="bg-trading-surface border-b border-trading-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-trading-accent" />
          <h1 className="text-xl font-bold text-trading-text">TradingBoard</h1>
        </div>

        <div className="flex items-center space-x-1">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-trading-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-trading-danger" />
          )}
          <span
            className={`text-sm ${
              isConnected ? "text-trading-success" : "text-trading-danger"
            }`}
          >
            {isConnected
              ? "Live Data"
              : dataSource === "fallback"
              ? "API Unavailable"
              : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-trading-text-muted">
          <Activity className="w-4 h-4" />
          <span>Last Update: {formatLastUpdate(lastUpdate)}</span>
        </div>

        <div className="text-sm text-trading-text-muted">
          {new Date().toLocaleString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
