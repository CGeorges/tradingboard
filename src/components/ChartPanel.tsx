import { useMarketStore } from "../store/marketStore";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

const ChartPanel: React.FC = () => {
  const { selectedSymbol } = useMarketStore();

  if (!selectedSymbol) {
    return (
      <div className="trading-panel h-full flex items-center justify-center">
        <div className="text-center text-trading-text-muted">
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
          </div>

          <div className="flex items-center space-x-2"></div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="flex-1">
        <AdvancedRealTimeChart
          symbol={selectedSymbol}
          theme="dark"
          autosize={true}
          timezone="Etc/UTC"
          locale="en"
          studies={["VWAP@tv-basicstudies", "MAExp@tv-basicstudies"]}
          hide_top_toolbar={false}
          hide_side_toolbar={false}
          enable_publishing={true}
          allow_symbol_change={false}
          save_image={false}
          container_id={`chart-${selectedSymbol}`}
        />
      </div>
    </div>
  );
};

export default ChartPanel;
