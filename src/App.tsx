import React, { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Header from "./components/Header";
import Watchlist from "./components/Watchlist";
import ChartPanel from "./components/ChartPanel";
import NewsPanel from "./components/NewsPanel";
import { marketDataService } from "./services/marketDataService";
import { useMarketStore } from "./store/marketStore";

function App() {
  const { initializeWatchlists } = useMarketStore();

  useEffect(() => {
    // Initialize watchlists from IndexedDB on app load
    initializeWatchlists().catch((error) => {
      console.error("Error initializing watchlists:", error);
    });

    // Cleanup on unmount
    return () => {
      marketDataService.disconnect();
    };
  }, [initializeWatchlists]);

  return (
    <div className="h-screen bg-trading-bg text-trading-text flex flex-col">
      <Header />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Watchlist */}
          <Panel
            defaultSizePercentage={25}
            minSizePercentage={20}
            maxSizePercentage={35}
          >
            <div className="h-full p-2">
              <Watchlist />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Center Panel - Charts */}
          <Panel defaultSizePercentage={55} minSizePercentage={40}>
            <div className="h-full p-2">
              <ChartPanel />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Right Panel - News & Info */}
          <Panel
            defaultSizePercentage={20}
            minSizePercentage={15}
            maxSizePercentage={30}
          >
            <div className="h-full p-2">
              <NewsPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
