import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Header from "./components/Header";
import Watchlist from "./components/Watchlist";
import ChartPanel from "./components/ChartPanel";
import TabbedInfoPanel from "./components/TabbedInfoPanel";
import { marketDataService } from "./services/marketDataService";
import { useMarketStore } from "./store/marketStore";

const PANEL_STORAGE_KEY = "trading-board-panel-layout";

interface PanelSizes {
  watchlist: number;
  chart: number;
  info: number;
}

const defaultPanelSizes: PanelSizes = {
  watchlist: 25,
  chart: 55,
  info: 20,
};

function App() {
  const { initializeWatchlists } = useMarketStore();
  const [panelSizes, setPanelSizes] = useState<PanelSizes>(() => {
    // Load saved panel sizes from localStorage
    const saved = localStorage.getItem(PANEL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultPanelSizes;
      }
    }
    return defaultPanelSizes;
  });

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

  const handleLayoutChange = (layout: number[]) => {
    const [watchlistSize, chartSize, infoSize] = layout;
    const newSizes: PanelSizes = {
      watchlist: watchlistSize,
      chart: chartSize,
      info: infoSize,
    };

    setPanelSizes(newSizes);
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(newSizes));
  };

  return (
    <div className="h-screen bg-trading-bg text-trading-text flex flex-col">
      <Header />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" onLayout={handleLayoutChange}>
          {/* Left Panel - Watchlist */}
          <Panel
            id="watchlist"
            defaultSize={panelSizes.watchlist}
            minSize={20}
            maxSize={35}
          >
            <div className="h-full p-2">
              <Watchlist />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Center Panel - Charts */}
          <Panel id="chart" defaultSize={panelSizes.chart} minSize={40}>
            <div className="h-full p-2">
              <ChartPanel />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-trading-border hover:bg-trading-accent transition-colors" />

          {/* Right Panel - Info Tabs */}
          <Panel
            id="info"
            defaultSize={panelSizes.info}
            minSize={15}
            maxSize={30}
          >
            <div className="h-full p-2">
              <TabbedInfoPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
