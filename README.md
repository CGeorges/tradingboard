# TradingBoard - Professional Trading Dashboard

A modern, real-time trading dashboard built with React, TypeScript, and Tailwind CSS. Features live market data, technical indicators, customizable watchlists, and AI-powered news summarization.

## 🚀 Features

### ✅ Implemented (Phase 1)

- **Real-Time Market Data**

  - Live price updates with WebSocket support
  - Bid/Ask spreads and volume data
  - Custom watchlists (My Watchlist, High Volatility)
  - Add/remove symbols dynamically

- **Charts & Technical Indicators**

  - Multi-timeframe charts (1M, 5M, 15M, 30M, 1H, 4H, 1D)
  - Technical indicators: VWAP, EMA20, EMA50
  - Volume charts with area visualization
  - Interactive tooltips and responsive design

- **News Feed & AI Summarization**
  - Filtered news by category (Earnings, Upgrades, Movers)
  - Sentiment analysis indicators
  - AI-powered news summarization (ready for agent-forge integration)
  - Real-time news updates

### 🔄 Coming Soon (Phase 2)

- **Trade Execution Panel**

  - Place, modify, and cancel orders
  - Bracket orders with stop-loss/take-profit
  - Hotkey support for rapid execution

- **Analytics & PnL Tracking**

  - Real-time PnL and position overview
  - Daily win/loss statistics
  - Risk metrics: max drawdown, R multiple, expectancy

- **Journal & Review Tools**
  - Trade thesis tracking
  - Entry/exit screenshots
  - Pattern tagging and review
  - Export to Notion/Excel

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom trading theme
- **Charts**: Recharts for financial visualization
- **State Management**: Zustand with subscriptions
- **Real-time Data**: WebSocket with reconnection logic
- **Icons**: Lucide React
- **Layout**: React Resizable Panels

## 🎨 Design Features

- **Dark Theme**: Optimized for trading environments
- **Professional Colors**:
  - Background: Deep blue (#0b1426)
  - Surface: Muted blue (#1a2332)
  - Accent: Trading blue (#3b82f6)
  - Success: Green (#10b981)
  - Danger: Red (#ef4444)
- **Typography**: Monospace fonts for price data
- **Responsive Layout**: Resizable panels for custom workflows

## 📦 Installation

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 🐳 Docker Deployment

The application is containerized for easy production deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t tradingboard .
docker run -p 8080:80 tradingboard
```

The application will be available at `http://localhost:8080`

#### Docker Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d

# Check health status
docker-compose ps
```

### 📦 Publishing Docker Image

#### Docker Hub

1. **Login to Docker Hub:**

```bash
docker login
```

2. **Build and tag the image:**

```bash
# Replace 'yourusername' with your Docker Hub username
docker build -t yourusername/tradingboard:latest .
docker build -t yourusername/tradingboard:v1.0.0 .
```

3. **Push to Docker Hub:**

```bash
docker push yourusername/tradingboard:latest
docker push yourusername/tradingboard:v1.0.0
```

4. **Use the published image:**

```bash
docker run -p 8080:80 yourusername/tradingboard:latest
```

#### GitHub Container Registry (GHCR)

1. **Create a Personal Access Token:**

   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `write:packages` scope

2. **Login to GHCR:**

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin
```

3. **Build and tag for GHCR:**

```bash
# Replace 'yourusername' with your GitHub username
docker build -t ghcr.io/yourusername/tradingboard:latest .
docker build -t ghcr.io/yourusername/tradingboard:v1.0.0 .
```

4. **Push to GHCR:**

```bash
docker push ghcr.io/yourusername/tradingboard:latest
docker push ghcr.io/yourusername/tradingboard:v1.0.0
```

#### 🤖 Automated Publishing with GitHub Actions

**Automated builds are already configured!** Every merge to the main branch automatically builds and pushes to Docker Hub at `cgeorges/tradingboard`.

**Setup Requirements:**

1. **Create Docker Hub Access Token:**

   - Go to Docker Hub → Account Settings → Security
   - Click "New Access Token"
   - Copy the generated token

2. **Add GitHub Secrets:**

   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these repository secrets:
     - `DOCKERHUB_USERNAME`: `cgeorges`
     - `DOCKERHUB_TOKEN`: (your Docker Hub access token)

3. **Trigger Build:**
   - Push/merge to main branch
   - Or manually trigger via Actions tab

**What happens automatically:**

- ✅ Builds multi-platform image (amd64, arm64)
- ✅ Pushes to `cgeorges/tradingboard:latest`
- ✅ Tags with branch name and commit SHA
- ✅ Updates Docker Hub description from README
- ✅ Uses build cache for faster builds

**Manual Publishing (if needed):**

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Polygon.io API Key for real-time stock data and news
# Get your free API key at: https://polygon.io/
VITE_POLYGON_API_KEY=your_polygon_api_key_here

# OpenAI API Key for agent-forge AI summarization (optional)
# Get your API key at: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here

# WebSocket URL for real-time data (optional - for premium providers)
# Examples: wss://socket.polygon.io/stocks, wss://ws.finnhub.io
VITE_WS_URL=wss://your-websocket-url.com

# Generic API key for other data providers (optional)
VITE_API_KEY=your_other_api_key_here
```

### Market Data Providers

The application now uses **real market data APIs**:

- **Polygon.io** - Real-time quotes, historical data, and news (primary)
- **IEX Cloud** - Financial data and news
- **Fallback Mode** - Enhanced demo data when APIs are unavailable

**Real data is now enabled by default!** Set your `VITE_ALPHA_VANTAGE_API_KEY` to get live market data.

### Getting Started with Real Data

1. **Get Polygon.io API Key** (free): https://polygon.io/
2. **Create `.env` file** with your API key
3. **Run the application** - it will automatically fetch real market data
4. **Rate Limits**: Free tier allows 5 API calls per minute, 500 per day

## 🎯 Usage

1. **Watchlist Management**

   - Switch between preset watchlists (My Watchlist, High Volatility)
   - Add new symbols using the input field
   - Remove symbols by clicking the minus icon
   - Search existing symbols

2. **Chart Analysis**

   - Click any symbol in watchlist to view charts
   - Switch timeframes using the buttons (1M, 5M, 15M, etc.)
   - Toggle technical indicators (VWAP, EMA20, EMA50)
   - View volume data in the lower chart

3. **News Monitoring**
   - Filter news by category or sentiment
   - Click the sparkle icon for AI summarization
   - Expand articles for full content
   - Open original articles in new tabs

## 🤖 AI Integration

The dashboard now includes **agent-forge framework integration** for enhanced news analysis:

### Current Implementation

- **Enhanced News Analysis Service**: Advanced sentiment analysis and key point extraction
- **Trading Signal Detection**: Identifies bullish/bearish catalysts and market impact
- **Smart Summarization**: Context-aware summaries for trading decisions
- **Agent-Forge Ready**: Framework integrated and ready for LLM-powered agents

### Usage

```typescript
// News analysis is automatically triggered
const analysis = await newsAnalysisService.analyzeNews(newsItem);

// Returns: {
//   summary: "AI-generated trading-focused summary",
//   sentiment: "positive" | "negative" | "neutral",
//   keyPoints: ["Key insight 1", "Key insight 2"],
//   marketImpact: "high" | "medium" | "low",
//   tradingSignals: ["Bullish earnings beat", "Analyst upgrade"]
// }
```

### Agent-Forge Integration

The `newsAnalysisService` can be easily replaced with full agent-forge AI agents:

```typescript
// TODO: Replace with agent-forge implementation
// const newsAgent = new TradingNewsAgent();
// await newsAgent.summarizeNews(newsItem);
```

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Header.tsx      # Status and title bar
│   ├── Watchlist.tsx   # Stock list and management
│   ├── ChartPanel.tsx  # Charts and indicators
│   └── NewsPanel.tsx   # News feed and filtering
├── services/           # Business logic
│   └── marketDataService.ts  # WebSocket and API calls
├── store/              # State management
│   └── marketStore.ts  # Zustand store
├── types/              # TypeScript definitions
│   └── market.ts       # Data interfaces
└── index.css          # Global styles and theme
```

## 📊 Performance

- **Real-time Updates**: 1-second price refresh rate
- **Chart Rendering**: Optimized with virtualization
- **Memory Management**: Automatic cleanup and limits
- **WebSocket**: Auto-reconnection with exponential backoff

## 🔒 Security

- Environment variable protection
- CORS handling for API requests
- Secure WebSocket connections (WSS)
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Real-time options chain data
- [ ] Advanced technical analysis tools
- [ ] Portfolio optimization algorithms
- [ ] Machine learning price predictions
- [ ] Mobile companion app
- [ ] Multi-asset support (crypto, forex, commodities)

---

**TradingBoard** - Your command center for professional trading decisions.
