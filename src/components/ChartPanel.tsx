import React, { useState } from "react";
import { BarChart3, Settings, TrendingUp, Clock } from "lucide-react";
import { useMarketStore } from "../store/marketStore";
import { TimeFrame } from "../types/market";
import TradingViewChart from "./TradingViewChart";
import clsx from "clsx";

const ChartPanel: React.FC = () => {
  const {
    selectedSymbol,
    stocks,
    chartSettings,
    isConnected,
    dataSource,
    setTimeframe,
  } = useMarketStore();

  const [showSettings, setShowSettings] = useState(false);

  // Map our timeframes to TradingView intervals
  const timeframeToInterval = (timeframe: TimeFrame): string => {
    const mapping: Record<TimeFrame, string> = {
      "1m": "1",
      "5m": "5",
      "15m": "15",
      "30m": "30",
      "1h": "60",
      "4h": "240",
      "1d": "D",
    };
    return mapping[timeframe] || "D";
  };

  const timeframes: { value: TimeFrame; label: string }[] = [
    { value: "1m", label: "1M" },
    { value: "5m", label: "5M" },
    { value: "15m", label: "15M" },
    { value: "30m", label: "30M" },
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
    { value: "1d", label: "1D" },
  ];

  const currentStock = selectedSymbol ? stocks[selectedSymbol] : null;

  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setTimeframe(timeframe);
  };

  if (!selectedSymbol) {
    return (
      <div className="trading-panel h-full flex items-center justify-center">
        <div className="text-center text-trading-text-muted">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a symbol from the watchlist to view charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-trading-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">{selectedSymbol}</h2>
            {currentStock && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-mono">
                  ${currentStock.price.toFixed(2)}
                </span>
                <span
                  className={clsx(
                    "font-mono",
                    currentStock.change > 0
                      ? "text-chart-green"
                      : currentStock.change < 0
                      ? "text-chart-red"
                      : "text-trading-text"
                  )}
                >
                  {currentStock.change >= 0 ? "+" : ""}
                  {currentStock.change.toFixed(2)} (
                  {currentStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "trading-button p-2",
                showSettings ? "bg-trading-accent text-white" : "bg-trading-bg"
              )}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        {showSettings && (
          <div className="flex space-x-1 mb-3">
            {timeframes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleTimeframeChange(value)}
                className={clsx(
                  "px-3 py-1 text-xs rounded transition-colors",
                  chartSettings.timeframe === value
                    ? "bg-trading-accent text-white"
                    : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TradingView Chart */}
      <div className="flex-1">
        <TradingViewChart
          symbol={selectedSymbol}
          interval={timeframeToInterval(chartSettings.timeframe)}
          theme="dark"
          autosize={true}
        />
      </div>
    </div>
  );
};

export default ChartPanel;
