import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Filter,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useMarketStore } from "../store/marketStore";
import { NewsItem } from "../types/market";
import { newsAnalysisService } from "../services/newsAnalysisService";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";

const NewsPanel: React.FC = () => {
  const {
    news,
    selectedNewsFilter,
    setNewsFilter,
    updateNews,
    isConnected,
    dataSource,
  } = useMarketStore();
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [analyzingNews, setAnalyzingNews] = useState<Set<string>>(new Set());

  // Initialize news analysis service
  useEffect(() => {
    newsAnalysisService.initialize();
  }, []);

  const newsFilters = [
    { value: "all", label: "All News" },
    { value: "earnings", label: "Earnings" },
    { value: "upgrades", label: "Upgrades" },
    { value: "movers", label: "Movers" },
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
  ];

  const filteredNews = news.filter((item) => {
    if (selectedNewsFilter === "all") return true;
    if (selectedNewsFilter === "positive") return item.sentiment === "positive";
    if (selectedNewsFilter === "negative") return item.sentiment === "negative";
    if (selectedNewsFilter === "earnings")
      return (
        item.title.toLowerCase().includes("earnings") ||
        item.title.toLowerCase().includes("quarter")
      );
    if (selectedNewsFilter === "upgrades")
      return (
        item.title.toLowerCase().includes("upgrade") ||
        item.title.toLowerCase().includes("downgrade")
      );
    if (selectedNewsFilter === "movers")
      return (
        item.title.toLowerCase().includes("mover") ||
        item.title.toLowerCase().includes("surge") ||
        item.title.toLowerCase().includes("jump")
      );
    return true;
  });

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-chart-green" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-chart-red" />;
      default:
        return <Newspaper className="w-4 h-4 text-trading-text-muted" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "border-l-chart-green";
      case "negative":
        return "border-l-chart-red";
      default:
        return "border-l-trading-border";
    }
  };

  const handleNewsExpand = (newsId: string) => {
    setExpandedNews(expandedNews === newsId ? null : newsId);
  };

  const handleAISummarize = async (newsItem: NewsItem) => {
    if (analyzingNews.has(newsItem.id)) return; // Prevent duplicate analysis

    try {
      setAnalyzingNews((prev) => new Set(prev).add(newsItem.id));

      // Use the enhanced news analysis service
      const analysis = await newsAnalysisService.analyzeNews(newsItem);

      // Update the news item with AI analysis
      updateNews(newsItem.id, {
        aiSummary: analysis.summary,
        sentiment: analysis.sentiment,
      });

      console.log("AI Analysis completed for:", newsItem.title);
      console.log("Summary:", analysis.summary);
      console.log("Sentiment:", analysis.sentiment);
      console.log("Key Points:", analysis.keyPoints);
      console.log("Market Impact:", analysis.marketImpact);
      console.log("Trading Signals:", analysis.tradingSignals);
    } catch (error) {
      console.error("Failed to analyze news:", error);
    } finally {
      setAnalyzingNews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(newsItem.id);
        return newSet;
      });
    }
  };

  return (
    <div className="trading-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-trading-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Market News</h2>
          <Filter className="w-4 h-4 text-trading-text-muted" />
        </div>

        {/* News Filters */}
        <div className="grid grid-cols-2 gap-1">
          {newsFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setNewsFilter(filter.value)}
              className={clsx(
                "px-2 py-1 text-xs rounded transition-colors text-left",
                selectedNewsFilter === filter.value
                  ? "bg-trading-accent text-white"
                  : "bg-trading-bg text-trading-text-muted hover:bg-trading-border"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!isConnected && dataSource === "fallback" ? (
          <div className="p-4 text-center">
            <Newspaper className="w-8 h-8 mx-auto mb-2 text-trading-danger opacity-50" />
            <div className="text-trading-danger mb-2">⚠️ News Unavailable</div>
            <div className="text-sm text-trading-text-muted">
              Polygon.io API error. News service is temporarily unavailable.
            </div>
            <div className="text-xs text-trading-text-muted mt-2">
              Please verify your API key or check your plan limits.
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-4 text-center text-trading-text-muted">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No news available</p>
          </div>
        ) : (
          <div className="space-y-3 p-3">
            {filteredNews.map((newsItem) => (
              <div
                key={newsItem.id}
                className={clsx(
                  "border-l-4 bg-trading-bg rounded-r border border-trading-border p-3 hover:bg-trading-surface transition-colors",
                  getSentimentColor(newsItem.sentiment)
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(newsItem.sentiment)}
                    <span className="text-xs text-trading-text-muted">
                      {newsItem.source}
                    </span>
                    <span className="text-xs text-trading-text-muted">
                      {formatDistanceToNow(newsItem.publishedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAISummarize(newsItem)}
                      className="p-1 hover:bg-trading-border rounded transition-colors"
                      title="Generate AI Summary"
                      disabled={analyzingNews.has(newsItem.id)}
                    >
                      {analyzingNews.has(newsItem.id) ? (
                        <Loader2 className="w-3 h-3 text-trading-accent animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-trading-accent" />
                      )}
                    </button>
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-trading-border rounded transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3 text-trading-text-muted" />
                    </a>
                  </div>
                </div>

                <h3
                  className="text-sm font-medium text-trading-text mb-2 cursor-pointer hover:text-trading-accent transition-colors"
                  onClick={() => handleNewsExpand(newsItem.id)}
                >
                  {newsItem.title}
                </h3>

                <p className="text-xs text-trading-text-muted mb-2 line-clamp-2">
                  {newsItem.summary}
                </p>

                {/* Symbols */}
                {newsItem.symbols.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {newsItem.symbols.map((symbol) => (
                      <span
                        key={symbol}
                        className="px-2 py-1 bg-trading-surface text-xs rounded text-trading-accent font-mono"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Summary */}
                {newsItem.aiSummary && (
                  <div className="mt-2 p-2 bg-trading-surface rounded border border-trading-accent/30">
                    <div className="flex items-center space-x-2 mb-1">
                      <Sparkles className="w-3 h-3 text-trading-accent" />
                      <span className="text-xs font-medium text-trading-accent">
                        AI Summary
                      </span>
                    </div>
                    <p className="text-xs text-trading-text">
                      {newsItem.aiSummary}
                    </p>
                  </div>
                )}

                {/* Expanded Content */}
                {expandedNews === newsItem.id && (
                  <div className="mt-3 pt-3 border-t border-trading-border">
                    <p className="text-xs text-trading-text-muted leading-relaxed">
                      {newsItem.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-trading-border text-center">
        <p className="text-xs text-trading-text-muted">
          Enhanced AI Analysis • Ready for Agent-Forge Integration
        </p>
      </div>
    </div>
  );
};

export default NewsPanel;
