import React, { useState } from "react";
import { LuCalendar, LuNewspaper, LuGrid3X3 } from "react-icons/lu";
import {
  EconomicCalendar,
  Timeline,
  StockHeatmap,
} from "react-ts-tradingview-widgets";
import clsx from "clsx";

const TabbedInfoPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"calendar" | "news" | "heatmap">(
    "calendar"
  );

  const tabs = [
    { id: "calendar" as const, label: "Calendar", icon: LuCalendar },
    { id: "news" as const, label: "News", icon: LuNewspaper },
    { id: "heatmap" as const, label: "Heatmap", icon: LuGrid3X3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <div className="h-full w-full">
            <EconomicCalendar
              colorTheme="dark"
              locale="en"
              width="100%"
              height="100%"
            />
          </div>
        );
      case "news":
        return (
          <div className="h-full w-full">
            <Timeline
              colorTheme="dark"
              locale="en"
              width="100%"
              height="100%"
            />
          </div>
        );
      case "heatmap":
        return (
          <div className="h-full w-full">
            <StockHeatmap
              colorTheme="dark"
              locale="en"
              width="100%"
              height="100%"
              dataSource="SPX500"
              blockSize="market_cap_basic"
              blockColor="change"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="trading-panel h-full flex flex-col">
      {/* Tab Header */}
      <div className="p-4 border-b border-trading-border">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center space-x-2 px-3 py-2 text-sm rounded transition-colors",
                  activeTab === tab.id
                    ? "bg-trading-accent text-white"
                    : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
                )}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
    </div>
  );
};

export default TabbedInfoPanel;
