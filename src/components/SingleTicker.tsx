import React from "react";
import { SingleTicker as TradingViewSingleTicker } from "react-ts-tradingview-widgets";

interface SingleTickerProps {
  symbol: string;
  onClick?: (symbol: string) => void;
  colorTheme?: "light" | "dark";
  isTransparent?: boolean;
  width?: number | string;
  height?: number | string;
}

const SingleTicker: React.FC<SingleTickerProps> = ({
  symbol,
  onClick,
  colorTheme = "dark",
  isTransparent = true,
  width = "100%",
  height = 46,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(symbol);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer single-ticker-widget hover:bg-trading-surface/50 transition-colors rounded p-1 relative"
      style={{ width, height }}
    >
      <div
        className="pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      >
        <TradingViewSingleTicker
          symbol={symbol}
          colorTheme={colorTheme}
          isTransparent={isTransparent}
          width={width}
          autosize={false}
          largeChartUrl="" // Disable TradingView chart opening
        />
      </div>
    </div>
  );
};

export default SingleTicker;
