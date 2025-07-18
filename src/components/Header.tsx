import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-trading-surface border-b border-trading-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-trading-text">TradingBoard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-trading-text-muted">
          {new Date().toLocaleString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
