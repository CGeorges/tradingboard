import React, { useEffect, useRef, memo } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  theme?: "light" | "dark";
  interval?: string;
  height?: number;
  width?: number | string;
  autosize?: boolean;
  timezone?: string;
  locale?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = memo(
  ({
    symbol,
    theme = "dark",
    interval = "D",
    height = 500,
    width = "100%",
    autosize = true,
    timezone = "Etc/UTC",
    locale = "en",
  }) => {
    const container = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
      // Clean up previous widget
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        widgetRef.current = null;
      }

      if (container.current) {
        // Clear container
        container.current.innerHTML = "";
      }

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      script.innerHTML = JSON.stringify({
        autosize: autosize,
        symbol: symbol,
        interval: interval,
        timezone: timezone,
        theme: theme,
        style: "1",
        locale: locale,
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        withdateranges: true,
        range: "YTD",
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: false,
        studies: ["VWAP@tv-basicstudies", "EMA@tv-basicstudies"],
        support_host: "https://www.tradingview.com",
      });

      if (container.current) {
        container.current.appendChild(script);
      }

      // Store reference for cleanup
      widgetRef.current = script;

      return () => {
        if (widgetRef.current && widgetRef.current.parentNode) {
          widgetRef.current.parentNode.removeChild(widgetRef.current);
        }
        widgetRef.current = null;
      };
    }, [symbol, theme, interval, autosize, timezone, locale]);

    return (
      <div className="tradingview-widget-container h-full w-full">
        <div
          ref={container}
          className="tradingview-widget h-full w-full"
          style={{
            height: autosize ? "100%" : height,
            width: autosize ? "100%" : width,
          }}
        />
        <div className="tradingview-widget-copyright">
          <a
            href={`https://www.tradingview.com/symbols/${symbol}/`}
            rel="noopener nofollow"
            target="_blank"
            className="text-xs text-trading-text-muted hover:text-trading-accent"
          >
            <span className="blue-text">{symbol} chart</span> by TradingView
          </a>
        </div>
      </div>
    );
  }
);

TradingViewChart.displayName = "TradingViewChart";

export default TradingViewChart;
